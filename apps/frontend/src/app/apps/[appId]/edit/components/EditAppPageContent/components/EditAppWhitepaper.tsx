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
  const fileName = form.watch("whitepaperFileName")

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
        form.setValue("whitepaperFileName", file.name)
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
    form.setValue("whitepaperFileName", "")
    if (inputRef.current) inputRef.current.value = ""
  }, [form])
  return (
    <VStack align="stretch" gap={4}>
      <VStack align="flex-start" gap={1}>
        <Heading textStyle="md" fontWeight="600">
          {t("Application Whitepaper")}
        </Heading>
        <Text textStyle="xs" color="gray.500">
          {t("Only PDF files are supported (less than 100MB)")}
        </Text>
      </VStack>

      <Input ref={inputRef} type="file" display="none" accept="application/pdf" onChange={handleChange} />

      {whitepaperFile ? (
        <HStack justify="space-between" w="full">
          <HStack gap={2}>
            {uploading ? <Spinner size="sm" /> : <UilFileAlt size="20px" />}
            {uploading ? (
              <Text textStyle="sm" color="gray.500">
                {t("Uploading…")}
              </Text>
            ) : (
              <Link href={viewUrl ?? ""} target="_blank" rel="noopener noreferrer" variant="underline" textStyle="sm">
                {fileName || "whitepaper.pdf"}
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
        <Button
          variant="outline"
          rounded="full"
          onClick={() => inputRef.current?.click()}
          loading={uploading}
          css={{
            _icon: {
              width: "4",
              height: "4",
            },
            paddingLeft: 8,
            paddingRight: 8,
            width: "fit-content",
          }}>
          <UilUpload />
          {t("Upload")}
        </Button>
      )}
    </VStack>
  )
}
