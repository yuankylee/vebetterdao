import { Box, Dialog, Image, Portal, CloseButton } from "@chakra-ui/react"
import { useState } from "react"

type Props = {
  src: string
  alt: string
  /** Props forwarded to the thumbnail Image */
  thumbnailProps?: Partial<React.ComponentProps<typeof Image>>
}

export const ExpandableImage = ({ src, alt, thumbnailProps }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box
        cursor="zoom-in"
        onClick={() => setOpen(true)}
        h="full"
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="center">
        <Image src={src} alt={alt} h="full" objectFit="contain" {...thumbnailProps} />
      </Box>

      <Dialog.Root open={open} onOpenChange={d => setOpen(d.open)} size="full" placement="center">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.900" />
          <Dialog.Positioner>
            <Dialog.Content bg="transparent" boxShadow="none" onClick={() => setOpen(false)}>
              <Dialog.CloseTrigger asChild onClick={e => e.stopPropagation()}>
                <CloseButton
                  size="lg"
                  color="white"
                  bg="whiteAlpha.200"
                  _hover={{ bg: "whiteAlpha.400" }}
                  borderRadius="full"
                  position="fixed"
                  top={4}
                  right={4}
                  zIndex="modal"
                />
              </Dialog.CloseTrigger>
              <Dialog.Body
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="100dvh"
                p={4}
                onClick={e => e.stopPropagation()}>
                <Image
                  src={src}
                  alt={alt}
                  maxH="90dvh"
                  maxW="100%"
                  objectFit="contain"
                  borderRadius="xl"
                  onClick={e => e.stopPropagation()}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
