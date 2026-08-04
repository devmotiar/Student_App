'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Link2, Video, ExternalLink, Loader2, Search } from 'lucide-react'

import { useAuth } from '@/lib/hooks/useAuth'
import { getAllMaterials, trackMaterialDownload, Material } from '@/lib/firebase-download-operations'
import { PageHeader } from '@/components/app/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function MaterialsPage() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getAllMaterials()
        setMaterials(data)
      } catch (err) {
        console.error('[v0] Failed to fetch materials:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || material.type === selectedType
    return matchesSearch && matchesType
  })

  const handleDownload = async (material: Material) => {
    if (!user) {
      alert('Please sign in to download materials')
      return
    }

    setDownloading(material.id)
    try {
      await trackMaterialDownload(user.uid, material)

      // Create a temporary link and click it
      const link = document.createElement('a')
      link.href = material.url
      link.download = material.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log('[v0] Material downloaded:', material.title)
    } catch (err) {
      console.error('[v0] Download failed:', err)
    } finally {
      setDownloading(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="size-5 text-red-500" />
      case 'doc':
        return <FileText className="size-5 text-blue-500" />
      case 'link':
        return <Link2 className="size-5 text-green-500" />
      case 'video':
        return <Video className="size-5 text-purple-500" />
      default:
        return <Download className="size-5 text-gray-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    const typeMap = {
      pdf: 'PDF Document',
      doc: 'Document',
      link: 'External Link',
      video: 'Video',
      resource: 'Resource',
    }
    return typeMap[type as keyof typeof typeMap] || type
  }

  const types = [...new Set(materials.map((m) => m.type))]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Study Materials"
        description="Access course materials, lecture notes, and resources."
      />

      {/* Search and Filter */}
      <Card className="p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {getTypeBadge(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'}
          </div>
        </div>
      </Card>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="p-4 flex flex-col hover:shadow-md transition-shadow">
              {/* Header with icon and type */}
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-muted rounded-lg">{getTypeIcon(material.type)}</div>
                <Badge variant="secondary">{getTypeBadge(material.type)}</Badge>
              </div>

              {/* Title and description */}
              <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{material.title}</h3>
              {material.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {material.description}
                </p>
              )}

              {/* Meta information */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 mt-auto pt-3 border-t border-border">
                {material.fileSize && (
                  <span>{(material.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                )}
                <span>•</span>
                <span>{material.downloadCount} downloads</span>
              </div>

              {/* Download button */}
              <Button
                onClick={() => handleDownload(material)}
                disabled={downloading === material.id}
                size="sm"
                className="w-full"
              >
                {downloading === material.id ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : material.type === 'link' ? (
                  <>
                    <ExternalLink className="size-4 mr-2" />
                    Open Link
                  </>
                ) : (
                  <>
                    <Download className="size-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Download className="size-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">No materials found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'Try adjusting your search' : 'No materials available yet'}
          </p>
        </div>
      )}

      {/* Stats */}
      <Card className="p-6 mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-foreground mb-3">Resources Available</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(
            materials.reduce(
              (acc, m) => {
                acc[m.type] = (acc[m.type] || 0) + 1
                return acc
              },
              {} as Record<string, number>
            )
          ).map(([type, count]) => (
            <div key={type} className="text-center">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{getTypeBadge(type)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
