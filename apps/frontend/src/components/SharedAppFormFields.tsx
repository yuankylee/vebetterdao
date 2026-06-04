import { UseFormRegisterReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { FormItem } from "./CustomFormFields/FormItem"

type FieldConfig = {
  register: UseFormRegisterReturn
  error?: string
}

type Props = {
  name: FieldConfig
  description: FieldConfig
  url: FieldConfig
  distribution: FieldConfig
}

/**
 * Common text fields shared by both the Create and Edit app forms.
 * Validation rules are passed in from each page (they differ between create and edit).
 */
export const SharedAppFormFields = ({ name, description, url, distribution }: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <FormItem
        required
        label={t("Name")}
        placeholder={t("Name")}
        description={t("The name of your app.")}
        register={name.register}
        error={name.error}
      />

      <FormItem
        required
        label={t("Description")}
        placeholder={t("description")}
        description={t("The description and purpose of your app.")}
        type="textarea"
        register={description.register}
        error={description.error}
      />

      <FormItem
        required
        label={t("Project URL")}
        placeholder={t("Project URL")}
        description={t("The URL of your app's website or repository.")}
        register={url.register}
        error={url.error}
      />

      <FormItem
        required
        label={t("How does your app distribute B3TR to the users?")}
        placeholder={t("Eg. Our goal is to distribute at least X percent of the round allocation each week.")}
        description={t(
          "Describe your app's distribution strategy. This information will be publicly visible once your app is submitted to VeBetter",
        )}
        type="textarea"
        register={distribution.register}
        error={distribution.error}
      />
    </>
  )
}
