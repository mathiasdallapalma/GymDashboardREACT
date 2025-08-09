import { createSystem, defaultConfig } from "@chakra-ui/react"
import { buttonRecipe } from "./theme/button.recipe"
import { useColorModeValue } from "./components/ui/color-mode"

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      fontSize: "16px",
    },
    body: {
      fontSize: "0.875rem",
      margin: 0,
      padding: 0,
    },
    ".main-link": {
      color: "ui.main",
      fontWeight: "bold",
    },
  },
  theme: {
    tokens: {
      colors: {
        ui: {
          main: { value: "#009688" },
        },
        custom: {
          white: { value: "#FFFFFF" },
          black: { value: "#232323" },
          limeGreen: { value: "#E2F163" },
          purple: { value: "#896CFE" },
          lightPurple: { value: "#B3A0FF" },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
})
