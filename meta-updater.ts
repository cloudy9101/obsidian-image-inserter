import { App, TFile } from "obsidian";

export const upsert = async (app: App, file: TFile, key: string, value: string) => {
  const content = await app.vault.read(file)
  if (!content.startsWith("---")) {
    return ["---", `${key}: ${value}`, "---", content].join("\n")
  }

  const secondTripleDashPos = content.indexOf("---", 3)
  const frontmatter = content.substring(0, secondTripleDashPos + 3)
  const rest = content.substring(secondTripleDashPos + 3)

  let keyExists = false
  const updatedFrontmatterLines = frontmatter.split("\n").map((line) => {
    if (line.startsWith(key)) {
      keyExists = true
      return `${key}: ${value}`
    }
    return line
  })
  const lastLine = updatedFrontmatterLines.pop()
  if (!keyExists) {
    updatedFrontmatterLines.push(`${key}: ${value}`)
  }
  if (lastLine) {
    updatedFrontmatterLines.push(lastLine)
  }
  const updatedFrontmatter = updatedFrontmatterLines.join("\n")

  return [updatedFrontmatter, rest].join("\n")
}
