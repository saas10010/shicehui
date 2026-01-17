export type MiniRole = 'parent' | 'student'

export function roleLabel(role: MiniRole) {
  return role === 'parent' ? '家长端' : '学生端'
}

export function safeRole(value: unknown): MiniRole {
  return value === 'student' ? 'student' : 'parent'
}

