import { createApp } from "vue";
import DiyUi from "@/components/DiyUi.vue";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        const app = createApp(DiyUi);
        app.mount(container);

        return app;
        // const app = document.createElement("p");
        // app.textContent = "我是插入的";
        // container.append(app);
      },
      // onRemove: (app) => {
      //   if (app) {
      //     app.unmount();
      //   }
      // },
    });
    ui.mount();
  },
});
