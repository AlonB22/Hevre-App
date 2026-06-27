import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.stubEnv('VITE_DEMO_PASSWORD', 'test-demo-password')
