import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function useFormValidation<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...options,
  });

  // Додаємо лог для діагностики тільки при помилках
  if (Object.keys(form.formState.errors).length > 0) {
    console.log('--- FORM VALIDATION ERRORS ---');
    console.log('Errors:', form.formState.errors);
  }

  return form;
}
