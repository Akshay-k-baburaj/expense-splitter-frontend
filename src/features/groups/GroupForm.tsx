import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GroupRequest } from "../../types/group";
import { groupSchema, type GroupFormValues } from "./groupSchema";
import { supportedCurrencies } from "../../utils/currency";

type GroupFormProps = {
  initialValues?: GroupRequest;
  submitLabel: string;
  onSave: (values: GroupFormValues) => Promise<void>;
  errorMessage: string;
  allowCurrencyChange?: boolean;
};

export default function GroupForm({ initialValues, submitLabel, onSave, errorMessage, allowCurrencyChange = false }: GroupFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: initialValues ?? { groupName: "", description: "", currencyCode: "INR" },
    values: initialValues,
  });

  return (
    <form className="group-form" onSubmit={handleSubmit(onSave)} noValidate>
      <div className="form-field">
        <label htmlFor="group-name">Group name</label>
        <input id="group-name" type="text" maxLength={100} aria-invalid={Boolean(errors.groupName)} aria-describedby={errors.groupName ? "group-name-error" : undefined} {...register("groupName")} />
        {errors.groupName && <p id="group-name-error" className="field-error">{errors.groupName.message}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="group-description">Description <span className="optional-label">Optional</span></label>
        <textarea id="group-description" rows={3} {...register("description")} />
      </div>
      {allowCurrencyChange ? <div className="form-field">
        <label htmlFor="group-currency">Group currency</label>
        <select id="group-currency" aria-invalid={Boolean(errors.currencyCode)} aria-describedby={errors.currencyCode ? "group-currency-error" : undefined} {...register("currencyCode")}>
          {supportedCurrencies.map((currency) => <option value={currency.code} key={currency.code}>{currency.code} · {currency.name}</option>)}
        </select>
        {errors.currencyCode && <p id="group-currency-error" className="field-error">{errors.currencyCode.message}</p>}
        <p className="field-help">All expenses and balances in this group use this currency.</p>
      </div> : <input type="hidden" {...register("currencyCode")} />}
      {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
      <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : submitLabel}</button>
    </form>
  );
}
