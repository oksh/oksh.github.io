import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { isResponseOk, post } from 'lib/common/fetch'
import { BASE_PATH } from 'lib/constants'
import type { ResponseError } from 'types'

export type SqlGenerateResponse = {
  title: string
  sql: string
}

export type SqlGenerateVariables = {
  prompt: string
  entityDefinitions?: string[]
}

export async function generateSql({ prompt, entityDefinitions }: SqlGenerateVariables) {
  const response = await post<SqlGenerateResponse>(BASE_PATH + '/api/ai/sql/generate', {
    prompt,
    entityDefinitions,
  })

  if (!isResponseOk(response)) {
    throw response.error
  }

  return response
}

type SqlGenerateData = Awaited<ReturnType<typeof generateSql>>

export const useSqlGenerateMutation = ({
  onSuccess,
  onError,
  ...options
}: Omit<
  UseMutationOptions<SqlGenerateData, ResponseError, SqlGenerateVariables>,
  'mutationFn'
> = {}) => {
  return useMutation<SqlGenerateData, ResponseError, SqlGenerateVariables>(
    (vars) => generateSql(vars),
    {
      async onSuccess(data, variables, context) {
        await onSuccess?.(data, variables, context)
      },
      async onError(data, variables, context) {
        if (onError === undefined) {
          toast.error(`Failed to generate SQL: ${data.message}`)
        } else {
          onError(data, variables, context)
        }
      },
      ...options,
    }
  )
}
