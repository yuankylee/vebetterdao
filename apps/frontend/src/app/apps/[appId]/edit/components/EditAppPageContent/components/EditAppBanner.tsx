import { Flex, IconButton, Image, Input, Text, VStack } from "@chakra-ui/react"
import { UilPen } from "@iconscout/react-unicons"
import { useCallback, useRef } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { toaster } from "@/components/ui/toaster"
import { blobToBase64 } from "@/utils/BlobUtils"
import { handleImageCompression } from "@/utils/imageListCompression"

import { RequiredAsterisk } from "../../../../../../../components/CustomFormFields/FormItem"
import { IMAGE_REQUIREMENTS, BANNER_UPLOAD_GUIDELINES } from "../../../../../../../constants/XAppsMedia"
import { EditAppForm } from "../EditAppPageContent"

const notFoundImage = "/assets/images/image-not-found.webp"

type Props = {
  form: UseFormReturn<EditAppForm, any, EditAppForm>
}

export const EditAppBanner = ({ form }: Props) => {
  const banner = form.watch("bannerImage")
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  const accept = IMAGE_REQUIREMENTS.banner.mimeType
  const handleClickEdit = useCallback(() => inputRef.current?.click(), [])

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0]
        if (file) {
          const compressedFile = await handleImageCompression(file)
          const base64File = await blobToBase64(compressedFile)
          form.setValue("bannerImage", base64File)
        }
      } catch (error) {
        toaster.error({
          title: "Error",
          description: "An error occurred while uploading the banner",
          duration: 5000,
          closable: true,
        })
        console.error(error)
      }
    },
    [form],
  )
  return (
    <VStack gap={2} align={"start"}>
      <Text textStyle="md" fontWeight="600">
        <RequiredAsterisk />
        {t("Banner")}
      </Text>
      <Flex w="full" h="200px" position={"relative"} rounded="9px">
        <Image
          src={banner ?? notFoundImage}
          alt={"banner"}
          h="full"
          w="full"
          rounded="9px"
          objectFit={"cover"}
          objectPosition={"center"}
        />
        <Input type="file" accept={accept} display={"none"} ref={inputRef} onChange={handleUpload} />
        <Flex
          rounded="9px"
          position="absolute"
          inset={0}
          alignItems="center"
          justifyContent="center"
          bg={"#00000005"}
          cursor={"pointer"}
          _hover={{ bg: "#00000033" }}
          onClick={handleClickEdit}>
          <IconButton aria-label="Edit banner" rounded={"full"} bg={"#00000033"} _hover={{ bg: "#00000033" }}>
            <UilPen color="white" />
          </IconButton>
        </Flex>
      </Flex>
      <Text textStyle="xs" color={"gray.500"} pt={0}>
        {t(BANNER_UPLOAD_GUIDELINES)}
      </Text>
    </VStack>
  )
}
