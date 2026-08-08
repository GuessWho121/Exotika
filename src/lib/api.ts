export class APIError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "APIError"
    this.status = status
    this.data = data
  }
}

interface RequestOptions extends RequestInit {
  json?: any
}

async function request(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers || {})
  
  if (options.json) {
    headers.set("Content-Type", "application/json")
    options.body = JSON.stringify(options.json)
  }

  const res = await fetch(path, {
    ...options,
    headers
  })

  let data: any = null
  const contentType = res.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    data = await res.json()
  } else {
    try {
      data = await res.text()
    } catch {
      // Ignore
    }
  }

  if (!res.ok) {
    const errorMsg = data?.message || `Request failed with status ${res.status}`
    throw new APIError(errorMsg, res.status, data)
  }

  return data
}

export const api = {
  get: (path: string, options?: Omit<RequestOptions, "method" | "body">) => 
    request(path, { ...options, method: "GET" }),
  post: (path: string, json?: any, options?: Omit<RequestOptions, "method" | "body" | "json">) => 
    request(path, { ...options, method: "POST", json }),
  put: (path: string, json?: any, options?: Omit<RequestOptions, "method" | "body" | "json">) => 
    request(path, { ...options, method: "PUT", json }),
  delete: (path: string, options?: Omit<RequestOptions, "method" | "body">) => 
    request(path, { ...options, method: "DELETE" }),
  raw: request
}
