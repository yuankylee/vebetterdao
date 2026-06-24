import { Field, InputGroup, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { WalletAddressInput } from "../app/components/Input/WalletAddressInput"

import { AddressIcon } from "./AddressIcon"
import { RequiredAsterisk } from "./CustomFormFields/FormItem"

type WalletFieldProps = {
  value: string
  onAddressResolved: (address?: string) => void
  disabled?: boolean
}

type Props = {
  treasury: WalletFieldProps
  admin: WalletFieldProps
}

export const SharedWalletAddressFields = ({ treasury, admin }: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <Field.Root invalid={!treasury.value}>
        <Field.Label textStyle="md" fontWeight="600">
          <RequiredAsterisk />
          {t("Treasury address")}
        </Field.Label>
        <Text textStyle="xs" color="gray.500" mb={2}>
          {t(`The wallet address where you will receive your app's B3TR`)}
        </Text>
        <InputGroup>
          <WalletAddressInput
            inputGroupProps={{
              startElement: (
                <AddressIcon
                  pointerEvents="none"
                  borderRadius={"full"}
                  boxSize={6}
                  minW={6}
                  minH={6}
                  address={treasury.value}
                />
              ),
            }}
            disabled={treasury.disabled}
            defaultValue={treasury.value}
            rounded={"xl"}
            onAddressResolved={treasury.onAddressResolved}
          />
        </InputGroup>
      </Field.Root>

      <Field.Root invalid={!admin.value}>
        <Field.Label textStyle="md" fontWeight="600">
          <RequiredAsterisk />
          {t("Admin address")}
        </Field.Label>
        <Text textStyle="xs" color="gray.500" mb={2}>
          {t("The wallet address which will be used to manage your app")}
        </Text>
        <InputGroup>
          <WalletAddressInput
            inputGroupProps={{
              startElement: <AddressIcon borderRadius={"full"} boxSize={6} minW={6} minH={6} address={admin.value} />,
            }}
            disabled={admin.disabled}
            defaultValue={admin.value}
            rounded={"xl"}
            onAddressResolved={admin.onAddressResolved}
          />
        </InputGroup>
      </Field.Root>
    </>
  )
}
