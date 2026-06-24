import { Button, Card, Field, HStack, Heading, IconButton, Input, Text, VStack } from "@chakra-ui/react"
import { UilPlus, UilTimes } from "@iconscout/react-unicons"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { EditAppForm } from "../EditAppPageContent"

const MAX_LINKS = 5
const X_PREFIX = "https://x.com/"

type Props = { form: UseFormReturn<EditAppForm, any, EditAppForm> }

export const EditSocialMediaUpdates = ({ form }: Props) => {
  const { t } = useTranslation()
  const tweetLinks = form.watch("tweetLinks")
  const [errors, setErrors] = useState<Record<number, string>>({})

  const validate = (value: string): string => {
    if (!value) return ""
    if (value.length > 100) return t("Maximum 100 characters")
    if (!value.startsWith(X_PREFIX)) return t("Please add the X.com post link.")
    return ""
  }

  const addLink = () => {
    if (tweetLinks.length >= MAX_LINKS) return
    form.setValue("tweetLinks", [...form.getValues("tweetLinks"), ""])
  }

  const removeLink = (index: number) => {
    form.setValue(
      "tweetLinks",
      form.getValues("tweetLinks").filter((_, i) => i !== index),
    )
    setErrors(prev => {
      const next: Record<number, string> = {}
      Object.entries(prev).forEach(([k, v]) => {
        const i = Number(k)
        if (i < index) next[i] = v
        else if (i > index) next[i - 1] = v
      })
      return next
    })
  }

  const updateLink = (index: number, value: string) => {
    const updated = form.getValues("tweetLinks").map((link, i) => (i === index ? value : link))
    form.setValue("tweetLinks", updated)
    setErrors(prev => ({ ...prev, [index]: validate(value) }))
  }

  const atMax = tweetLinks.length >= MAX_LINKS

  return (
    <Card.Root variant="outline" w="full">
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <VStack align="flex-start" gap={1}>
            <Heading textStyle="md" fontWeight="600">
              {t("Social Media Updates")}
            </Heading>
            <Text textStyle="sm" color="text.subtle">
              {t(
                "Add X.com post links to achieve seamless synchronization and association of app information, making it easy for users to stay instantly updated on the latest app news.",
              )}
            </Text>
          </VStack>

          {tweetLinks.length > 0 && (
            <VStack align="stretch" gap={3}>
              {tweetLinks.map((link, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Field.Root key={index} invalid={!!errors[index]} w="full">
                  <HStack gap={2} align="flex-start" w="full">
                    <VStack align="stretch" flex={1} gap={1}>
                      <Input
                        value={link}
                        onChange={e => updateLink(index, e.target.value)}
                        placeholder={t("Please add social media links.")}
                      />
                      {errors[index] && <Field.ErrorText textStyle="xs">{errors[index]}</Field.ErrorText>}
                    </VStack>
                    <IconButton
                      aria-label={t("Remove link")}
                      variant="outline"
                      rounded="full"
                      mt="1px"
                      onClick={() => removeLink(index)}>
                      <UilTimes size="16px" />
                    </IconButton>
                  </HStack>
                </Field.Root>
              ))}
            </VStack>
          )}

          {!atMax && (
            <Button
              variant="tertiary"
              px={10}
              rounded="full"
              alignSelf="flex-start"
              onClick={addLink}
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
