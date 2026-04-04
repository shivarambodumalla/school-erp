export async function handleApiResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Something went wrong' }))
    throw { status: res.status, ...data }
  }
  return res.json()
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return (error as { error: string }).error
  }
  return 'Something went wrong'
}

export function isDependencyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'DEPENDENCY_BLOCK'
}
