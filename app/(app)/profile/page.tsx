
'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import {
  Camera,
  Check,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react'

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updateProfile,
} from 'firebase/auth'

import {
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

import {
  auth,
  db,
} from '@/lib/firebase'

import { useAuth } from '@/lib/hooks/useAuth'

/* =========================================================
   Helpers
========================================================= */

function getInitials(
  name?: string | null,
  email?: string | null,
) {
  if (name && name.trim()) {
    const parts = name
      .trim()
      .split(/\s+/)

    if (parts.length > 1) {
      return `${parts[0][0]}${
        parts[parts.length - 1][0]
      }`.toUpperCase()
    }

    return parts[0]
      .slice(0, 2)
      .toUpperCase()
  }

  if (email) {
    return email
      .slice(0, 2)
      .toUpperCase()
  }

  return 'U'
}

/* =========================================================
   Profile Page
========================================================= */

export default function ProfilePage() {
  const {
    user,
    userProfile,
    loading: authLoading,
  } = useAuth()

  /* =======================================================
     Form
  ======================================================= */

  const [displayName, setDisplayName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [originalEmail, setOriginalEmail] =
    useState('')

  const [currentPassword, setCurrentPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  /* =======================================================
     Profile Picture
     
     IMPORTANT:
     The image is NOT uploaded to Firebase.
     It is only stored temporarily in browser memory.
  ======================================================= */

  const [imagePreview, setImagePreview] =
    useState<string | null>(null)

  const [removingImage, setRemovingImage] =
    useState(false)

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  /* =======================================================
     UI State
  ======================================================= */

  const [savingProfile, setSavingProfile] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [errorMessage, setErrorMessage] =
    useState('')

  /* =======================================================
     Load Profile
  ======================================================= */

  useEffect(() => {
    if (!user && !userProfile) {
      return
    }

    const profile =
      userProfile as any

    const name =
      profile?.displayName ||
      user?.displayName ||
      ''

    const userEmail =
      profile?.email ||
      user?.email ||
      ''

    setDisplayName(name)
    setEmail(userEmail)
    setOriginalEmail(userEmail)
  }, [user, userProfile])

  /* =======================================================
     Cleanup Local Image Preview
  ======================================================= */

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  /* =======================================================
     Messages
  ======================================================= */

  const showSuccess = (
    message: string,
  ) => {
    setErrorMessage('')
    setSuccessMessage(message)

    setTimeout(() => {
      setSuccessMessage('')
    }, 5000)
  }

  const showError = (
    message: string,
  ) => {
    setSuccessMessage('')
    setErrorMessage(message)
  }

  /* =======================================================
     Select Profile Picture
     
     NO Firebase Storage
     NO Firestore
     NO Database update
  ======================================================= */

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    /* ---------------------------------------------------
       Validate file type
    --------------------------------------------------- */

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      showError(
        'Only JPG, PNG and WebP images are allowed.',
      )

      event.target.value = ''
      return
    }

    /* ---------------------------------------------------
       Validate file size
    --------------------------------------------------- */

    const maxSize =
      5 * 1024 * 1024

    if (file.size > maxSize) {
      showError(
        'Profile picture must be smaller than 5MB.',
      )

      event.target.value = ''
      return
    }

    /* ---------------------------------------------------
       Create local browser preview
    --------------------------------------------------- */

    const previewURL =
      URL.createObjectURL(file)

    /* ---------------------------------------------------
       Remove previous local preview
    --------------------------------------------------- */

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview,
      )
    }

    /* ---------------------------------------------------
       Show selected image immediately
    --------------------------------------------------- */

    setImagePreview(previewURL)

    showSuccess(
      'Profile picture selected successfully!',
    )

    /* ---------------------------------------------------
       Reset input
       This allows selecting the same image again.
    --------------------------------------------------- */

    event.target.value = ''
  }

  /* =======================================================
     Remove Local Profile Picture
  ======================================================= */

  const handleRemovePhoto = () => {
    setRemovingImage(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview,
        )
      }

      setImagePreview(null)

      showSuccess(
        'Profile picture removed successfully!',
      )
    } catch (error) {
      console.error(
        '[Profile] Remove image error:',
        error,
      )

      showError(
        'Unable to remove profile picture.',
      )
    } finally {
      setRemovingImage(false)
    }
  }

  /* =======================================================
     Save Profile
     
     Only saves:
     - displayName
     - email
     
     Profile image is NOT saved.
  ======================================================= */

  const handleSaveProfile =
    async () => {
      if (!user) {
        showError(
          'You must be logged in.',
        )

        return
      }

      if (!auth) {
        showError(
          'Firebase Authentication is not initialized.',
        )

        return
      }

      if (!db) {
        showError(
          'Firebase Firestore is not initialized.',
        )

        return
      }

      setSavingProfile(true)
      setErrorMessage('')
      setSuccessMessage('')

      try {
        const newName =
          displayName.trim()

        const newEmail =
          email.trim()

        /* ---------------------------------------------------
           Validation
        --------------------------------------------------- */

        if (!newName) {
          throw new Error(
            'Display name is required.',
          )
        }

        if (!newEmail) {
          throw new Error(
            'Email address is required.',
          )
        }

        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (
          !emailRegex.test(
            newEmail,
          )
        ) {
          throw new Error(
            'Please enter a valid email address.',
          )
        }

        const oldName =
          user.displayName || ''

        const nameChanged =
          newName !== oldName

        const emailChanged =
          newEmail.toLowerCase() !==
          originalEmail
            .toLowerCase()

        /* ---------------------------------------------------
           Update Firebase Auth Display Name
        --------------------------------------------------- */

        if (nameChanged) {
          await updateProfile(
            user,
            {
              displayName:
                newName,
            },
          )
        }

        /* ---------------------------------------------------
           Update Firebase Auth Email
        --------------------------------------------------- */

        if (emailChanged) {
          if (!currentPassword) {
            throw new Error(
              'Enter your current password to change your email address.',
            )
          }

          const currentEmail =
            user.email ||
            originalEmail

          if (!currentEmail) {
            throw new Error(
              'Current email address is unavailable.',
            )
          }

          const credential =
            EmailAuthProvider.credential(
              currentEmail,
              currentPassword,
            )

          await reauthenticateWithCredential(
            user,
            credential,
          )

          await updateEmail(
            user,
            newEmail,
          )
        }

        /* ---------------------------------------------------
           Update Firestore User Document
           
           IMPORTANT:
           No photoURL
           No photoPath
        --------------------------------------------------- */

        const userRef =
          doc(
            db,
            'users',
            user.uid,
          )

        await updateDoc(
          userRef,
          {
            displayName:
              newName,

            email:
              newEmail,

            updatedAt:
              serverTimestamp(),
          },
        )

        /* ---------------------------------------------------
           Update Local State
        --------------------------------------------------- */

        setDisplayName(
          newName,
        )

        setEmail(
          newEmail,
        )

        setOriginalEmail(
          newEmail,
        )

        setCurrentPassword('')

        showSuccess(
          'Profile information updated successfully!',
        )
      } catch (error: any) {
        console.error(
          '[Profile] Update error:',
          error,
        )

        let message =
          'Unable to update your profile.'

        switch (
          error?.code
        ) {
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            message =
              'The current password is incorrect.'
            break

          case 'auth/email-already-in-use':
            message =
              'This email address is already in use.'
            break

          case 'auth/invalid-email':
            message =
              'The email address is invalid.'
            break

          case 'auth/requires-recent-login':
            message =
              'Please login again before changing your email.'
            break

          default:
            if (
              error?.message
            ) {
              message =
                error.message
            }
        }

        showError(message)
      } finally {
        setSavingProfile(false)
      }
    }

  /* =======================================================
     Reset
  ======================================================= */

  const handleReset = () => {
    const profile =
      userProfile as any

    setDisplayName(
      profile?.displayName ||
        user?.displayName ||
        '',
    )

    setEmail(
      profile?.email ||
        user?.email ||
        '',
    )

    setCurrentPassword('')

    setErrorMessage('')
    setSuccessMessage('')
  }

  /* =======================================================
     Loading
  ======================================================= */

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />

          <span>
            Loading profile...
          </span>
        </div>
      </div>
    )
  }

  /* =======================================================
     Data
  ======================================================= */

  const profile =
    userProfile as any

  /*
   * Priority:
   * 1. Local selected image
   * 2. Firebase Auth photoURL if one already exists
   *
   * Newly selected images are NEVER uploaded.
   */

  const currentPhoto =
    imagePreview ||
    user?.photoURL ||
    null

  const currentName =
    displayName ||
    user?.displayName ||
    'Student'

  const currentEmail =
    email ||
    user?.email ||
    ''

  const role =
    profile?.role ||
    'student'

  const enrolledCourses =
    Array.isArray(
      profile?.enrolledCourses,
    )
      ? profile.enrolledCourses
      : []

  const initials =
    getInitials(
      currentName,
      currentEmail,
    )

  const emailChanged =
    email.trim().toLowerCase() !==
    originalEmail
      .trim()
      .toLowerCase()

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* =================================================
          Header
      ================================================= */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information
          and account settings.
        </p>
      </div>

      {/* =================================================
          Success Message
      ================================================= */}

      {successMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">

          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="size-4 text-emerald-600" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Success
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage('')
            }
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* =================================================
          Error Message
      ================================================= */}

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">

          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15">
            <X className="size-4 text-destructive" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              Error
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {errorMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setErrorMessage('')
            }
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* =================================================
          Profile Header
      ================================================= */}

      <section className="mb-6 overflow-hidden rounded-2xl border bg-card shadow-sm">

        <div className="h-28 bg-gradient-to-r from-primary/25 via-primary/10 to-accent sm:h-36" />

        <div className="px-5 pb-6 sm:px-8">

          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end">

            {/* Avatar */}

            <div className="relative shrink-0">

              <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-primary text-3xl font-bold text-primary-foreground shadow-xl sm:size-32">

                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Profile"
                    className="size-full object-cover"
                  />
                ) : (
                  initials
                )}

              </div>

              {/* Camera Button */}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  removingImage
                }
                className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition hover:scale-105 disabled:opacity-50"
              >
                <Camera className="size-4" />
              </button>

              {/* Hidden File Input */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

            </div>

            {/* User */}

            <div className="flex-1 pb-1">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-xl font-bold sm:text-2xl">
                  {currentName}
                </h2>

                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                  {role}
                </span>

              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {currentEmail}
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          Stats
      ================================================= */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">

        {/* Enrolled Courses */}

        <div className="rounded-2xl border bg-card p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted-foreground">
                Enrolled Courses
              </p>

              <p className="mt-2 text-2xl font-bold">
                {enrolledCourses.length}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>

          </div>
        </div>

        {/* Account Type */}

        <div className="rounded-2xl border bg-card p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted-foreground">
                Account Type
              </p>

              <p className="mt-2 text-2xl font-bold capitalize">
                {role}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>

          </div>
        </div>

        {/* Profile Status */}

        <div className="rounded-2xl border bg-card p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted-foreground">
                Profile Status
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="size-2 rounded-full bg-emerald-500" />

                <span className="text-lg font-bold">
                  Active
                </span>

              </div>
            </div>

            <Check className="size-5 text-emerald-600" />

          </div>
        </div>

      </div>

      {/* =================================================
          Main Content
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* =================================================
            Personal Information
        ================================================= */}

        <section className="rounded-2xl border bg-card shadow-sm">

          <div className="border-b px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-5" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Personal Information
                </h3>

                <p className="text-xs text-muted-foreground">
                  Update your account information
                </p>
              </div>

            </div>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* Name */}

            <div>

              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-medium"
              >
                Display Name
              </label>

              <div className="relative">

                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="displayName"
                  value={
                    displayName
                  }
                  onChange={e =>
                    setDisplayName(
                      e.target.value,
                    )
                  }
                  className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Enter your name"
                />

              </div>

            </div>

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email Address
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e =>
                    setEmail(
                      e.target.value,
                    )
                  }
                  className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Enter email"
                />

              </div>

            </div>

            {/* Password */}

            {emailChanged && (
              <div>

                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  Current Password
                </label>

                <div className="relative">

                  <input
                    id="currentPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      currentPassword
                    }
                    onChange={e =>
                      setCurrentPassword(
                        e.target.value,
                      )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-4 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        value =>
                          !value,
                      )
                    }
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md hover:bg-muted"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Required only when changing
                  your email address.
                </p>

              </div>
            )}

            {/* Actions */}

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  handleReset
                }
                disabled={
                  savingProfile
                }
                className="h-11 rounded-lg border px-5 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveProfile
                }
                disabled={
                  savingProfile
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >

                {savingProfile ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            Right Sidebar
        ================================================= */}

        <aside className="space-y-6">

          {/* Profile Image */}

          <section className="rounded-2xl border bg-card p-5 shadow-sm">

            <div className="mb-5">

              <div className="flex items-center gap-3">

                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Camera className="size-5" />
                </div>

                <div>

                  <h3 className="font-semibold">
                    Profile Picture
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP · Max 5MB
                  </p>

                </div>

              </div>

            </div>

            {/* Image Preview */}

            <div className="mb-5 flex justify-center">

              <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-muted bg-primary text-3xl font-bold text-primary-foreground">

                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Profile"
                    className="size-full object-cover"
                  />
                ) : (
                  initials
                )}

              </div>

            </div>

            {/* Change Picture */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                removingImage
              }
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Pencil className="size-4" />
              Change Picture
            </button>

            {/* Remove Picture */}

            {imagePreview && (
              <button
                type="button"
                onClick={
                  handleRemovePhoto
                }
                disabled={
                  removingImage
                }
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >

                {removingImage ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Picture'
                )}

              </button>
            )}

            {/* Information */}

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Your selected picture is displayed
              locally and is not uploaded to Firebase.
            </p>

          </section>

          {/* Account */}

          <section className="rounded-2xl border bg-card shadow-sm">

            <div className="border-b p-5">

              <div className="flex items-center gap-3">

                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Shield className="size-5" />
                </div>

                <div>

                  <h3 className="font-semibold">
                    Account Details
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Account information
                  </p>

                </div>

              </div>

            </div>

            <div className="divide-y">

              {/* User ID */}

              <div className="p-5">

                <p className="text-xs text-muted-foreground">
                  User ID
                </p>

                <p className="mt-1 break-all text-xs font-medium">
                  {user?.uid ||
                    'Not available'}
                </p>

              </div>

              {/* Role */}

              <div className="flex items-center justify-between p-5">

                <div>

                  <p className="text-xs text-muted-foreground">
                    Role
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize">
                    {role}
                  </p>

                </div>

                <Shield className="size-4 text-muted-foreground" />

              </div>

              {/* Enrolled Courses */}

              <div className="flex items-center justify-between p-5">

                <div>

                  <p className="text-xs text-muted-foreground">
                    Enrolled Courses
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {
                      enrolledCourses.length
                    }
                  </p>

                </div>

                <Users className="size-4 text-muted-foreground" />

              </div>

            </div>

          </section>

        </aside>

      </div>

    </div>
  )
}

