import {
  Box,
  Button,
  Card,
  Field,
  HStack,
  Heading,
  IconButton,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { UilDraggabledots, UilPlus, UilTimes, UilTrash, UilUpload } from "@iconscout/react-unicons"
import { Reorder, useDragControls } from "framer-motion"
import { ChangeEvent, useCallback, useRef, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

const notFoundImage = "/assets/images/image-not-found.webp"
import { toaster } from "@/components/ui/toaster"
import { AVG_PHONE_WIDTH, VE_WOLRD_SCALING_FACTOR } from "@/constants/XAppsMedia"
import { uploadBlobToIPFS } from "@/utils/ipfs"
import { convertUriToUrl } from "@/utils/uri"

import { EditAppForm } from "../EditAppPageContent"

const MAX_FILE_BYTES = 100 * 1024 * 1024 // 100 MB
const MAX_TEAM_MEMBERS = 10
const MAX_PARTNERS = 10
const computedWidth = Math.min(window.innerWidth, AVG_PHONE_WIDTH) / VE_WOLRD_SCALING_FACTOR
const safeConvertUri = (url: string): string => {
  try {
    return convertUriToUrl(url)
  } catch {
    return url
  }
}

type Props = { form: UseFormReturn<EditAppForm, any, EditAppForm> }

export const EditMoreAppDetails = ({ form }: Props) => {
  const { t } = useTranslation()
  const enabled = form.watch("moreDetailsEnabled")

  return (
    <VStack align="stretch" gap={4}>
      <Heading size="2xl">{t("More App Details")}</Heading>
      <Switch.Root
        checked={enabled}
        onCheckedChange={({ checked }) => form.setValue("moreDetailsEnabled", checked)}
        colorPalette="primary">
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>

      {enabled && (
        <VStack align="stretch" gap={6}>
          <TeamBackgroundSection form={form} />
          <AppRoadmapSection form={form} />
          <EcosystemPartnersSection form={form} />
        </VStack>
      )}
    </VStack>
  )
}

// ─── Team Background ──────────────────────────────────────────────────────────

type TeamMember = { photo: string; title: string; description: string }

const TeamBackgroundSection = ({ form }: Props) => {
  const { t } = useTranslation()
  const members = form.watch("teamBackground")
  const atMax = members.length >= MAX_TEAM_MEMBERS

  const addMember = () => {
    form.setValue("teamBackground", [...members, { photo: "", title: "", description: "" }])
  }

  const removeMember = (index: number) => {
    form.setValue(
      "teamBackground",
      form.getValues("teamBackground").filter((_, i) => i !== index),
    )
  }

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = form.getValues("teamBackground").map((m, i) => (i === index ? { ...m, [field]: value } : m))
    form.setValue("teamBackground", updated)
  }

  return (
    <Card.Root variant="outline" bg="#F9F9FA">
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" gap={1} flex={1}>
              <Heading size="md">{t("Team Background")}</Heading>
              <Text textStyle="sm" color="text.subtle">
                {t(
                  "Provide team and founder information so users can gain in-depth understanding of the stories and professional backgrounds behind the project, thereby building a deeper sense of trust. (Recommended size: 200*200px)",
                )}
              </Text>
            </VStack>
            <Text textStyle="sm" color="text.subtle" flexShrink={0}>
              {members.length}
              {" / "}
              {MAX_TEAM_MEMBERS}
            </Text>
          </HStack>

          {members.length > 0 && (
            <SimpleGrid columns={[1, 2]} gap={4}>
              {members.map((member, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <TeamMemberCard
                  key={index}
                  member={member}
                  index={index}
                  onUpdate={updateMember}
                  onRemove={removeMember}
                />
              ))}
            </SimpleGrid>
          )}

          {!atMax && (
            <Button
              variant="tertiary"
              rounded="full"
              alignSelf="flex-start"
              onClick={addMember}
              px={8}
              css={{
                _icon: {
                  width: "4",
                  height: "4",
                },
              }}>
              <UilPlus />
              {t("Add")}
            </Button>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

const TeamMemberCard = ({
  member,
  index,
  onUpdate,
  onRemove,
}: {
  member: TeamMember
  index: number
  onUpdate: (index: number, field: keyof TeamMember, value: string) => void
  onRemove: (index: number) => void
}) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [titleError, setTitleError] = useState("")
  const [descError, setDescError] = useState("")
  const displayUrl = member.photo ? safeConvertUri(member.photo) : null

  const handlePhotoChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > MAX_FILE_BYTES) {
        toaster.error({ title: t("Max file size: 100MB"), duration: 4000, closable: true })
        if (inputRef.current) inputRef.current.value = ""
        return
      }
      try {
        setUploading(true)
        const cid = await uploadBlobToIPFS(file, file.name)
        onUpdate(index, "photo", `ipfs://${cid}`)
      } catch {
        toaster.error({ title: t("Upload failed. Please try again."), duration: 4000, closable: true })
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [index, onUpdate, t],
  )

  const handleTitleChange = (value: string) => {
    setTitleError(value.length > 100 ? t("Maximum 100 characters") : "")
    onUpdate(index, "title", value)
  }

  const handleDescChange = (value: string) => {
    setDescError(value.length > 1000 ? t("Maximum 1000 characters") : "")
    onUpdate(index, "description", value)
  }

  return (
    <Box bg="white" borderRadius="xl" p={4}>
      <Input ref={inputRef} type="file" display="none" accept="image/*" onChange={handlePhotoChange} />
      <VStack align="stretch" gap={3}>
        {/* Photo row */}
        <HStack gap={3} justify={"space-between"} align="center" w="full">
          <Box
            w="40px"
            h="40px"
            borderRadius="full"
            overflow="hidden"
            flexShrink={0}
            bg="bg.tertiary"
            display="flex"
            alignItems="center"
            justifyContent="center">
            {uploading ? (
              <Spinner size="sm" />
            ) : displayUrl ? (
              <Image src={displayUrl} alt={`Member ${index + 1}`} w="full" h="full" objectFit="cover" />
            ) : (
              <Box w="full" h="full" bg="gray.200" />
            )}
          </Box>
          <HStack justify={"space-between"}>
            <Button
              variant="tertiary"
              rounded="full"
              size="md"
              onClick={() => inputRef.current?.click()}
              loading={uploading}
              px={8}
              css={{
                _icon: {
                  width: "4",
                  height: "4",
                },
              }}>
              <UilUpload />
              {t("Upload")}
            </Button>
            {member.photo && !uploading && (
              <IconButton
                aria-label={t("Delete photo")}
                variant="outline"
                color="status.negative.primary"
                rounded="full"
                size="md"
                onClick={() => {
                  onUpdate(index, "photo", "")
                  if (inputRef.current) inputRef.current.value = ""
                }}>
                <UilTrash size="16px" />
              </IconButton>
            )}
            <IconButton
              aria-label={t("Remove member")}
              variant="outline"
              rounded="full"
              size="md"
              ml="auto"
              onClick={() => onRemove(index)}>
              <UilTimes size="16px" />
            </IconButton>
          </HStack>
        </HStack>

        {/* Title */}
        <Field.Root invalid={!!titleError}>
          <Input
            placeholder={t("Please enter a title")}
            value={member.title}
            onChange={e => handleTitleChange(e.target.value)}
          />
          {titleError && <Field.ErrorText textStyle="xs">{titleError}</Field.ErrorText>}
        </Field.Root>

        {/* Description */}
        <Field.Root invalid={!!descError}>
          <Textarea
            placeholder={t("Please enter a description")}
            value={member.description}
            onChange={e => handleDescChange(e.target.value)}
            resize="none"
            h="120px"
          />
          {descError && <Field.ErrorText textStyle="xs">{descError}</Field.ErrorText>}
        </Field.Root>
      </VStack>
    </Box>
  )
}

// ─── App Roadmap ──────────────────────────────────────────────────────────────

const AppRoadmapSection = ({ form }: Props) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const roadmapImage = form.watch("appRoadmapImage")
  const roadmapDescription = form.watch("appRoadmapDescription")
  const displayUrl = roadmapImage ? safeConvertUri(roadmapImage) : null

  const handleImageChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > MAX_FILE_BYTES) {
        toaster.error({ title: t("Max file size: 100MB"), duration: 4000, closable: true })
        if (inputRef.current) inputRef.current.value = ""
        return
      }
      try {
        setUploading(true)
        const cid = await uploadBlobToIPFS(file, file.name)
        form.setValue("appRoadmapImage", `ipfs://${cid}`)
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
    form.setValue("appRoadmapImage", "")
    if (inputRef.current) inputRef.current.value = ""
  }, [form])

  return (
    <Card.Root variant="outline" bg="#F9F9FA">
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <VStack align="flex-start" gap={1}>
            <Heading size="md">{t("App Roadmap")}</Heading>
            <Text textStyle="sm" color="text.subtle">
              {t(
                "Provide a clear app roadmap so users can always stay informed about the product's future plans and development direction.",
              )}
            </Text>
          </VStack>

          <Input ref={inputRef} type="file" display="none" accept="image/*" onChange={handleImageChange} />

          {/* Image area */}
          {uploading ? (
            <HStack justify="center" p={8}>
              <Spinner />
            </HStack>
          ) : (
            <HStack justify="center" style={{ position: "relative" }}>
              <Image
                src={displayUrl ?? notFoundImage}
                alt={t("App Roadmap")}
                style={{ height: 76, width: computedWidth, borderRadius: 12, overflow: "hidden" }}
                objectFit="cover"
              />
              {roadmapImage && !uploading && (
                <HStack
                  bg="rgba(0,0,0,0.25)"
                  width="44px"
                  height="44px"
                  position="absolute"
                  top={4}
                  justifyContent="center"
                  borderRadius={"full"}
                  style={{ touchAction: "none" }}>
                  <IconButton
                    aria-label={t("Delete")}
                    variant="ghost"
                    color="status.negative.primary"
                    rounded="full"
                    onClick={handleDelete}>
                    <UilTrash size="16px" />
                  </IconButton>
                </HStack>
              )}
            </HStack>
          )}

          <HStack>
            <Button
              variant="tertiary"
              rounded="full"
              onClick={() => inputRef.current?.click()}
              loading={uploading}
              px={8}
              css={{
                _icon: {
                  width: "4",
                  height: "4",
                },
              }}>
              <UilUpload />
              {t("Upload")}
            </Button>
          </HStack>

          <Textarea
            placeholder={t("Description")}
            value={roadmapDescription}
            onChange={e => form.setValue("appRoadmapDescription", e.target.value)}
            resize="none"
            h="140px"
            css={{
              borderRadius: "12px",
              background: "#FFF",
            }}
          />
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

// ─── Ecosystem Partners ───────────────────────────────────────────────────────

const EcosystemPartnersSection = ({ form }: Props) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const partners = form.watch("ecosystemPartners")
  const atMax = partners.length >= MAX_PARTNERS

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return
      if (inputRef.current) inputRef.current.value = ""

      const toUpload = files.slice(0, MAX_PARTNERS - form.getValues("ecosystemPartners").length)
      for (const file of toUpload) {
        if (file.size > MAX_FILE_BYTES) {
          toaster.error({ title: t("Max file size: 100MB"), duration: 4000, closable: true })
          continue
        }
        try {
          setUploading(true)
          const cid = await uploadBlobToIPFS(file, file.name)
          form.setValue("ecosystemPartners", [...form.getValues("ecosystemPartners"), `ipfs://${cid}`])
        } catch {
          toaster.error({ title: t("Upload failed. Please try again."), duration: 4000, closable: true })
        } finally {
          setUploading(false)
        }
      }
    },
    [form, t],
  )

  const handleRemove = useCallback(
    (index: number) => {
      form.setValue(
        "ecosystemPartners",
        form.getValues("ecosystemPartners").filter((_, i) => i !== index),
      )
    },
    [form],
  )

  return (
    <Card.Root variant="outline" bg="#F9F9FA">
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" gap={1} flex={1}>
              <Heading size="md">{t("Ecosystem Partners")}</Heading>
              <Text textStyle="sm" color="text.subtle">
                {t(
                  "Displaying partner information can effectively enhance users' sense of trust in the application. (Suggested size: 512×512 pixels, keep a 1:1 square image)",
                )}
              </Text>
            </VStack>
            <Text textStyle="sm" color="text.subtle" flexShrink={0}>
              {partners.length}
              {" / "}
              {MAX_PARTNERS}
            </Text>
          </HStack>

          <Input ref={inputRef} type="file" display="none" accept="image/*" multiple onChange={handleChange} />

          <Box display="flex" overflowX="auto" gap={3} alignItems="flex-end">
            <Reorder.Group
              axis="x"
              values={partners}
              onReorder={urls => form.setValue("ecosystemPartners", urls)}
              layoutScroll
              as="div"
              style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
              {partners.map((url, index) => (
                <DraggablePartner key={url} url={url} index={index} onRemove={handleRemove} />
              ))}
            </Reorder.Group>
            {!atMax && (
              <Box
                onClick={() => inputRef.current?.click()}
                w="100px"
                h="100px"
                flexShrink={0}
                bg="bg.secondary"
                borderRadius="lg"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1}
                border="1px solid"
                borderColor="border.primary"
                cursor="pointer"
                _hover={{ bg: "bg.tertiary" }}>
                {uploading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <UilPlus size="20px" />
                    <Text textStyle="xs">{t("Upload")}</Text>
                  </>
                )}
              </Box>
            )}
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

const DraggablePartner = ({
  url,
  index,
  onRemove,
}: {
  url: string
  index: number
  onRemove: (index: number) => void
}) => {
  const { t } = useTranslation()
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={url}
      as="div"
      style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}
      dragListener={false}
      dragControls={dragControls}>
      <HStack
        bg="rgba(0, 0, 0, 0.2)"
        width="100%"
        height="30px"
        position="absolute"
        top={0}
        justifyContent="space-between"
        style={{ touchAction: "none", zIndex: 2 }}>
        <IconButton
          rounded="full"
          color="white"
          bgColor="transparent"
          _hover={{ bgColor: "gray.600" }}
          aria-label={t("Drag image")}
          size="2xs"
          onPointerDown={event => dragControls.start(event)}>
          <UilDraggabledots />
        </IconButton>
        <IconButton
          rounded="full"
          color="#D23F63"
          bgColor="#FCEEF1"
          _hover={{ bgColor: "#FCEEF1DD" }}
          aria-label="Delete screenshot"
          size="2xs"
          onClick={() => onRemove(index)}>
          <UilTrash />
        </IconButton>
      </HStack>
      <Image
        src={safeConvertUri(url)}
        alt={`Partner ${index + 1}`}
        w="100px"
        h="100px"
        objectFit="contain"
        borderRadius="lg"
        bg="white"
        p={2}
        draggable="false"
        style={{ touchAction: "none", cursor: "grab" }}
        onPointerDown={e => dragControls.start(e)}
      />
    </Reorder.Item>
  )
}
