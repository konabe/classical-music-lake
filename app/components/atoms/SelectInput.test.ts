import { mountSuspended } from "@nuxt/test-utils/runtime";
import SelectInput from "./SelectInput.vue";

const options = [
  { value: "交響曲", label: "交響曲" },
  { value: "協奏曲", label: "協奏曲" },
  { value: "室内楽", label: "室内楽" },
];

describe("SelectInput", () => {
  it("select 要素が表示される", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "", options },
    });
    expect(wrapper.find("select.select-input").exists()).toBe(true);
  });

  it("選択肢が表示される", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "", options },
    });
    const optionElements = wrapper.findAll("option");
    // 空の先頭オプション + 3つの選択肢
    expect(optionElements).toHaveLength(4);
    expect(optionElements[1].text()).toBe("交響曲");
    expect(optionElements[2].text()).toBe("協奏曲");
    expect(optionElements[3].text()).toBe("室内楽");
  });

  it("未選択時は空文字列の先頭オプションが選択されている", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "", options },
    });
    const select = wrapper.find("select").element as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  it("先頭オプションにプレースホルダーが表示される", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "", options, placeholder: "選択してください" },
    });
    const firstOption = wrapper.findAll("option")[0];
    expect(firstOption.text()).toBe("選択してください");
    expect(firstOption.attributes("value")).toBe("");
  });

  it("プレースホルダー未指定時はデフォルトテキストが表示される", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "", options },
    });
    const firstOption = wrapper.findAll("option")[0];
    expect(firstOption.text()).toBe("---");
  });

  it("modelValue が select の value に反映される", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "協奏曲", options },
    });
    const select = wrapper.find("select").element as HTMLSelectElement;
    expect(select.value).toBe("協奏曲");
  });

  it("選択変更時に update:modelValue が emit される", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "", options },
    });
    await wrapper.find("select").setValue("室内楽");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["室内楽"]);
  });

  it("未選択に戻すと空文字列が emit される", async () => {
    const wrapper = await mountSuspended(SelectInput, {
      props: { modelValue: "交響曲", options },
    });
    await wrapper.find("select").setValue("");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""]);
  });
});
