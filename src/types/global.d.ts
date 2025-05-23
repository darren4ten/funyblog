/// <reference types="react" />

import React from 'react'
import { D1Database } from '@cloudflare/workers-types'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  var DB: D1Database | undefined
} 