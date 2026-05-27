import { Button, HStack, Heading, IconButton, Image, Input, RadioGroup, Spinner, Text, VStack } from "@chakra-ui/react"
import { UilDraggabledots, UilTrash, UilUpload } from "@iconscout/react-unicons"
import { Reorder, useDragControls } from "framer-motion"
import { ChangeEvent, useCallback, useRef, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { toaster } from "@/components/ui/toaster"
import { uploadBlobToIPFS } from "@/utils/ipfs"
import { convertUriToUrl } from "@/utils/uri"

import { EditAppForm } from "../EditAppPageContent"

const MAX_FILE_BYTES = 100 * 1024 * 1024 // 100 MB
const MAX_IMAGES = 5

const safeConvertUri = (url: string): string => {
  try {
    return convertUriToUrl(url)
  } catch {
    return url
  }
}

type Props = {
  form: UseFormReturn<EditAppForm, any, EditAppForm>
}

export const EditAppTutorial = ({ form }: Props) => {
  const { t } = useTranslation()
  const mode = form.watch("tutorialMode")

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="flex-start" gap={1}>
        <Heading size="2xl">{t("App Tutorial")}</Heading>
        <Text textStyle="sm" color="text.subtle">
          {t("Provide app tutorials to help users get started quickly and easily understand the App's features.")}
        </Text>
      </VStack>

      <RadioGroup.Root
        value={mode}
        onValueChange={({ value }) => form.setValue("tutorialMode", value as "video" | "image")}>
        <HStack gap={6}>
          <RadioGroup.Item value="video">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{t("Video")}</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="image">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{t("Image")}</RadioGroup.ItemText>
          </RadioGroup.Item>
        </HStack>
      </RadioGroup.Root>

      {mode === "video" ? <TutorialVideo form={form} /> : <TutorialImages form={form} />}
    </VStack>
  )
}

// ─── Video ────────────────────────────────────────────────────────────────────

const TutorialVideo = ({ form }: Props) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  // object URL for preview in current session; falls back to IPFS URL for loaded data
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const tutorialVideo = form.watch("tutorialVideo")

  const displayUrl = previewUrl || (tutorialVideo ? safeConvertUri(tutorialVideo) : null)

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > MAX_FILE_BYTES) {
        toaster.error({ title: t("Max file size: 100MB"), duration: 4000, closable: true })
        return
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      try {
        setUploading(true)
        const cid = await uploadBlobToIPFS(file, file.name)
        form.setValue("tutorialVideo", `ipfs://${cid}`)
      } catch {
        toaster.error({ title: t("Upload failed. Please try again."), duration: 4000, closable: true })
        setPreviewUrl(null)
        form.setValue("tutorialVideo", "")
      } finally {
        setUploading(false)
        // Reset input so the same file can be re-selected
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [form, t],
  )

  const handleDelete = useCallback(() => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    form.setValue("tutorialVideo", "")
    if (inputRef.current) inputRef.current.value = ""
  }, [previewUrl, form])

  return (
    <VStack align="flex-start" gap={4}>
      <Input ref={inputRef} type="file" display="none" accept="video/mp4,video/*" onChange={handleChange} />

      {displayUrl ? (
        <VStack align="stretch" w="full" gap={2}>
          <HStack justify="space-between">
            <Text textStyle="sm" color="text.subtle">
              {uploading ? t("Uploading…") : t("Video uploaded")}
            </Text>
            <IconButton
              aria-label={t("Delete video")}
              variant="ghost"
              color="status.negative.primary"
              rounded="full"
              size="sm"
              onClick={handleDelete}>
              <UilTrash size="16px" />
            </IconButton>
          </HStack>
          {uploading ? (
            <HStack justify="center" p={8}>
              <Spinner />
            </HStack>
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={displayUrl} controls style={{ maxHeight: 280, width: "100%", borderRadius: 12 }} />
          )}
        </VStack>
      ) : (
        <Button variant="tertiary" rounded="full" onClick={() => inputRef.current?.click()} loading={uploading}>
          <UilUpload size="16px" />
          {t("Upload")}
        </Button>
      )}
    </VStack>
  )
}

// ─── Images ───────────────────────────────────────────────────────────────────

const TutorialImages = ({ form }: Props) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  // ipfsUrl → objectUrl (for current-session preview)
  const [previewMap, setPreviewMap] = useState<Map<string, string>>(new Map())
  const tutorialImages = form.watch("tutorialImages")

  const atMax = tutorialImages.length >= MAX_IMAGES

  const getDisplayUrl = useCallback((url: string) => previewMap.get(url) ?? safeConvertUri(url), [previewMap])

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return
      if (inputRef.current) inputRef.current.value = ""

      const remaining = MAX_IMAGES - tutorialImages.length
      const toUpload = files.slice(0, remaining)

      for (const file of toUpload) {
        if (file.size > MAX_FILE_BYTES) {
          toaster.error({ title: t("Max file size: 100MB"), duration: 4000, closable: true })
          continue
        }
        const objectUrl = URL.createObjectURL(file)
        try {
          setUploading(true)
          const cid = await uploadBlobToIPFS(file, file.name)
          const ipfsUrl = `ipfs://${cid}`
          setPreviewMap(prev => new Map(prev).set(ipfsUrl, objectUrl))
          form.setValue("tutorialImages", [...form.getValues("tutorialImages"), ipfsUrl])
        } catch {
          toaster.error({ title: t("Upload failed. Please try again."), duration: 4000, closable: true })
          URL.revokeObjectURL(objectUrl)
        } finally {
          setUploading(false)
        }
      }
    },
    [form, tutorialImages.length, t],
  )

  const handleDelete = useCallback(
    (url: string) => {
      const objectUrl = previewMap.get(url)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setPreviewMap(prev => {
        const next = new Map(prev)
        next.delete(url)
        return next
      })
      form.setValue(
        "tutorialImages",
        form.getValues("tutorialImages").filter(u => u !== url),
      )
    },
    [form, previewMap],
  )

  return (
    <VStack align="flex-start" gap={4} w="full">
      <Input ref={inputRef} type="file" display="none" accept="image/*" multiple onChange={handleChange} />

      {!atMax && (
        <Button variant="tertiary" rounded="full" onClick={() => inputRef.current?.click()} loading={uploading}>
          <UilUpload size="16px" />
          {t("Upload")}
        </Button>
      )}

      {tutorialImages.length === 0 && (
        <Text color="text.subtle" textStyle="sm">
          {t("No images added yet")}
        </Text>
      )}

      <Reorder.Group
        axis="x"
        values={tutorialImages}
        onReorder={urls => form.setValue("tutorialImages", urls)}
        layoutScroll
        as="div"
        style={{ gap: "8px", alignItems: "center", overflowX: "auto", whiteSpace: "nowrap", width: "100%" }}>
        {tutorialImages.map((url, index) => (
          <DraggableImage key={url} url={url} displayUrl={getDisplayUrl(url)} index={index} onDelete={handleDelete} />
        ))}
      </Reorder.Group>
    </VStack>
  )
}

const DraggableImage = ({
  url,
  displayUrl,
  index,
  onDelete,
}: {
  url: string
  displayUrl: string
  index: number
  onDelete: (url: string) => void
}) => {
  const dragControls = useDragControls()
  const { t } = useTranslation()

  return (
    <Reorder.Item
      value={url}
      as="div"
      style={{ display: "inline-block", width: "auto", height: 200, margin: "0 4px", position: "relative" }}
      dragListener={false}
      dragControls={dragControls}>
      <HStack
        bg="rgba(0,0,0,0.25)"
        width="100%"
        height="44px"
        position="absolute"
        top={0}
        justifyContent="space-between"
        padding="8px"
        style={{ touchAction: "none" }}>
        <IconButton
          rounded="full"
          color="white"
          bgColor="transparent"
          _hover={{ bgColor: "gray.600" }}
          aria-label={t("Drag image")}
          onPointerDown={event => dragControls.start(event)}>
          <UilDraggabledots size="20px" />
        </IconButton>
        <IconButton
          rounded="full"
          color="#D23F63"
          bgColor="#FCEEF1"
          _hover={{ bgColor: "#FCEEF1DD" }}
          aria-label={t("Delete image")}
          onClick={() => onDelete(url)}>
          <UilTrash size="20px" />
        </IconButton>
      </HStack>
      <Image src={displayUrl} alt={`Tutorial image ${index + 1}`} h="full" objectFit="contain" draggable="false" />
    </Reorder.Item>
  )
}
