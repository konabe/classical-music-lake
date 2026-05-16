import { mountSuspended } from "@nuxt/test-utils/runtime";
import TextInput from "@/components/atoms/TextInput.vue";

describe("TextInput", () => {
  it("デフォルトの type は text", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "" },
    });
    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  it("type=email を渡せる", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "", type: "email" },
    });
    expect(wrapper.find("input").attributes("type")).toBe("email");
  });

  it("type=password を渡せる", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "", type: "password" },
    });
    expect(wrapper.find("input").attributes("type")).toBe("password");
  });

  it("modelValue が input の value に反映される", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "テスト入力" },
    });
    expect(wrapper.find("input").element.value).toBe("テスト入力");
  });

  it("placeholder が渡される", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "", placeholder: "例：ベートーヴェン" },
    });
    expect(wrapper.find("input").attributes("placeholder")).toBe("例：ベートーヴェン");
  });

  it("disabled=true のとき input に disabled 属性が付く", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "", disabled: true },
    });
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
  });

  it("disabled=false のとき disabled 属性が付かない", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "", disabled: false },
    });
    expect(wrapper.find("input").attributes("disabled")).toBeUndefined();
  });

  it("入力時に update:modelValue が emit される", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "" },
    });
    await wrapper.find("input").setValue("新しい値");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["新しい値"]);
  });

  it("text-input クラスが付いている", async () => {
    const wrapper = await mountSuspended(TextInput, {
      props: { modelValue: "" },
    });
    expect(wrapper.find("input.text-input").exists()).toBe(true);
  });
});
