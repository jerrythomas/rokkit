import { c as create_ssr_component, b as createEventDispatcher, d as add_attribute, e as escape, f as each, v as validate_component } from "../../chunks/index.js";
/* empty css                                                   */const __uno = "";
const tailwind = "";
const app = "";
const defaultFields = {
  id: "id",
  url: "url",
  text: "text",
  data: "data",
  icon: "icon",
  image: "image",
  component: "component"
};
const TabItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  let { icon = null } = $$props;
  let { label } = $$props;
  let { active = false } = $$props;
  let { removable = false } = $$props;
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.removable === void 0 && $$bindings.removable && removable !== void 0)
    $$bindings.removable(removable);
  return `
<tab class="${["flex flex-row items-center", active ? "active" : ""].join(" ").trim()}">${icon ? `<icon${add_attribute("class", icon, 0)}${add_attribute("aria-label", icon, 0)}></icon>` : ``}
	${label ? `<p class="${"flex flex-shrink-0 flex-grow justify-center"}">${escape(label)}</p>` : ``}
	${removable ? `<icon class="${"remove small"}" aria-label="${"remove"}"></icon>` : ``}</tab>`;
});
const TabItems = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filtered;
  createEventDispatcher();
  let { items = [] } = $$props;
  let { fields = {} } = $$props;
  let { allowClose = false } = $$props;
  let { activeItem = items[0] } = $$props;
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.fields === void 0 && $$bindings.fields && fields !== void 0)
    $$bindings.fields(fields);
  if ($$props.allowClose === void 0 && $$bindings.allowClose && allowClose !== void 0)
    $$bindings.allowClose(allowClose);
  if ($$props.activeItem === void 0 && $$bindings.activeItem && activeItem !== void 0)
    $$bindings.activeItem(activeItem);
  fields = { ...defaultFields, ...fields };
  filtered = items.filter((item) => !item.isClosed);
  return `${each(filtered, (item, index) => {
    let label = item[fields.text];
    return `
	${validate_component(TabItem, "TabItem").$$render(
      $$result,
      {
        icon: item[fields.icon],
        label,
        allowClose,
        active: activeItem == item
      },
      {},
      {}
    )}`;
  })}`;
});
const Tabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { class: className } = $$props;
  let { items = [] } = $$props;
  let { fields = {} } = $$props;
  let { title = null } = $$props;
  let { allowAdd = false } = $$props;
  let { allowClose = false } = $$props;
  let { activeItem = items[0] } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.fields === void 0 && $$bindings.fields && fields !== void 0)
    $$bindings.fields(fields);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.allowAdd === void 0 && $$bindings.allowAdd && allowAdd !== void 0)
    $$bindings.allowAdd(allowAdd);
  if ($$props.allowClose === void 0 && $$bindings.allowClose && allowClose !== void 0)
    $$bindings.allowClose(allowClose);
  if ($$props.activeItem === void 0 && $$bindings.activeItem && activeItem !== void 0)
    $$bindings.activeItem(activeItem);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      console.log(activeItem);
    }
    $$rendered = `<tab-view class="${"flex flex-col w-full flex-grow " + escape(className, true)}"><tabs class="${"flex flex-row flex-shrink-0 w-full select-none cursor-pointer"}">${title ? `<p>${escape(title)}</p>` : ``}
		${validate_component(TabItems, "TabItems").$$render(
      $$result,
      { items, fields, allowClose, activeItem },
      {
        activeItem: ($$value) => {
          activeItem = $$value;
          $$settled = false;
        }
      },
      {}
    )}
		${allowAdd ? `${validate_component(TabItem, "TabItem").$$render($$result, { label: "+" }, {}, {})}` : ``}</tabs>
	<content class="${"flex flex-col flex-grow"}">${slots.default ? slots.default({}) : ``}</content></tab-view>`;
  } while (!$$settled);
  return $$rendered;
});
const ButtonGroup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  let { class: className = "" } = $$props;
  let { items = [] } = $$props;
  let { fields = {} } = $$props;
  let { type = "toggle" } = $$props;
  let { value = null } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.fields === void 0 && $$bindings.fields && fields !== void 0)
    $$bindings.fields(fields);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  fields = { ...defaultFields, ...fields };
  return `<button-group class="${"flex flex-row " + escape(className, true)}">${each(items, (item) => {
    let text = typeof item === "string" ? item : item[defaultFields.text];
    return `
		<button class="${["flex px-2 select-none cursor-pointer", value == item ? "active" : ""].join(" ").trim()}">${escape(text)}
		</button>`;
  })}
</button-group>`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const themes = ["minimal", "material", "spicy"];
  const items = [
    { icon: "menu", content: "menu" },
    { icon: "themes", content: "themes" },
    {
      icon: "properties",
      content: "properties"
    }
  ];
  let currentTheme = themes[2];
  let currentTab = items[0];
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<aside class="${"sidebar"}">${validate_component(Tabs, "Tabs").$$render(
      $$result,
      {
        items,
        class: "lg",
        activeItem: currentTab
      },
      {
        activeItem: ($$value) => {
          currentTab = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${escape(currentTab.content)}`;
        }
      }
    )}</aside>
<main class="${"flex flex-col flex-grow"}"><header class="${"flex flex-row items-center"}">${validate_component(ButtonGroup, "ButtonGroup").$$render($$result, { items: themes, value: currentTheme }, {}, {})}</header>
	<content class="${"flex flex-col h-full w-full overflow-y-scroll"}">${slots.default ? slots.default({}) : ``}</content></main>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Layout as default
};
