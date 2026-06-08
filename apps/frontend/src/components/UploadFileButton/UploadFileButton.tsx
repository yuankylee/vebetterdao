import { Input, Button, ButtonProps } from "@chakra-ui/react"
import { UilUpload } from "@iconscout/react-unicons"
import { useId, ChangeEventHandler, forwardRef } from "react"
import { useTranslation } from "react-i18next"

interface Props extends Omit<ButtonProps, "onChange"> {
  onChange: ChangeEventHandler<HTMLInputElement>
}
export const UploadFileButton = forwardRef<HTMLButtonElement, Props>(({ onChange, ...props }, ref) => {
  const { t } = useTranslation()
  const id = useId()
  return (
    <Button
      ref={ref}
      as="label"
      cursor="pointer"
      // htmlFor={id}
      variant="outline"
      rounded="full"
      px={8}
      css={{
        _icon: {
          width: "4",
          height: "4",
        },
      }}
      {...props}>
      <UilUpload />
      {t("Upload")}
      <Input display="none" type="file" id={id} name={id} onChange={onChange} />
    </Button>
  )
})
