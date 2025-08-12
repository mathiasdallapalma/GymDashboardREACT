import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  client: "legacy/axios",
  input: "./openapi.json",
  output: "./src/client",
  plugins: [
    {
      name: "@hey-api/sdk",
      asClass: true,
      operationId: true,
methodNameBuilder: (operation) => {
  // @ts-ignore
  let name = operation.name

  console.log("---- DEBUG ----")
  console.log("operation.name:", name)

  // 1. Extract version
  let versionSuffix = ""
  const versionMatch = name.match(/ApiV\d+/i)
  if (versionMatch) {
    versionSuffix = versionMatch[0] // e.g., "ApiV1"
    name = name.split(versionMatch[0])[0] // take only before version
  }

  // 2. Remove trailing HTTP verb if present
  name = name.replace(/(Get|Post|Put|Delete|Patch)$/i, "")

  // 3. Lowercase first char
  const finalName = name.charAt(0).toLowerCase() + name.slice(1) + (versionSuffix || "")

  console.log("FINAL NAME:", finalName)
  console.log("---------------")

  return finalName
}



    },
  ],
})

