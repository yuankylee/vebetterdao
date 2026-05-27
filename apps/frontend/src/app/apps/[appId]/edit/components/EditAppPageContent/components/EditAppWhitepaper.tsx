import { Button, HStack, Heading, IconButton, Input, Link, Spinner, Text, VStack } from "@chakra-ui/react"
import { UilFileAlt, UilTrash, UilUpload } from "@iconscout/react-unicons"
import { ChangeEvent, useCallback, useRef, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { toaster } from "@/components/ui/toaster"
import { uploadBlobToIPFS } from "@/utils/ipfs"
import { convertUriToUrl } from "@/utils/uri"

import { EditAppForm } from "../EditAppPageContent"

const MAX_FILE_BYTES = 100 * 1024 * 1024 // 100 MB

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

export const EditAppWhitepaper = ({ form }: Props) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const whitepaperFile = form.watch("whitepaperFile")

  const viewUrl = whitepaperFile ? safeConvertUri(whitepaperFile) : null

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.type !== "application/pdf") {
        toaster.error({ title: t("Please upload PDF files."), duration: 4000, closable: true })
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      if (file.size > MAX_FILE_BYTES) {
        toaster.error({ title: t("Max file size: 100MB"), duration: 4000, closable: true })
        if (inputRef.current) inputRef.current.value = ""
        return
      }

      try {
        setUploading(true)
        const cid = await uploadBlobToIPFS(file, file.name)
        form.setValue("whitepaperFile", `ipfs://${cid}`)
      } catch {
        toaster.error({ title: t("Upload failed. Please try again."), duration: 4000, closable: true })
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [form, t],
  )

  const handleDelete = useCallback(() => {
    form.setValue("whitepaperFile", "")
    if (inputRef.current) inputRef.current.value = ""
  }, [form])

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="flex-start" gap={1}>
        <Heading size="2xl">{t("Application Whitepaper")}</Heading>
        <Text textStyle="sm" color="text.subtle">
          {t("PDF only, max 100MB")}
        </Text>
      </VStack>

      <Input ref={inputRef} type="file" display="none" accept="application/pdf" onChange={handleChange} />

      {whitepaperFile ? (
        <HStack justify="space-between" w="full">
          <HStack gap={2}>
            {uploading ? <Spinner size="sm" /> : <UilFileAlt size="20px" />}
            <Text textStyle="sm" color="text.subtle">
              {uploading ? t("Uploading…") : t("PDF uploaded")}
            </Text>
            {!uploading && viewUrl && (
              <Link href={viewUrl} target="_blank" rel="noopener noreferrer" variant="underline" textStyle="sm">
                {t("View")}
              </Link>
            )}
          </HStack>
          <IconButton
            aria-label={t("Delete file")}
            variant="ghost"
            color="status.negative.primary"
            rounded="full"
            size="sm"
            onClick={handleDelete}
            disabled={uploading}>
            <UilTrash size="16px" />
          </IconButton>
        </HStack>
      ) : (
        <Button variant="tertiary" rounded="full" onClick={() => inputRef.current?.click()} loading={uploading}>
          <UilUpload size="16px" />
          {t("Upload")}
        </Button>
      )}
    </VStack>
  )
}
