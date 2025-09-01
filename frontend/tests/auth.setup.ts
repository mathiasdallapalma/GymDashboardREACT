import { test as setup } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.ts"

const authFile = "playwright/.auth/user.json"

setup("authenticate", async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));

  await page.goto("/login")
  await page.getByPlaceholder("example@example.com").fill(firstSuperuser)
  await page.getByPlaceholder("************").fill(firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/")
  await page.context().storageState({ path: authFile })
})
