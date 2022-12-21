import { c as create_ssr_component, i as compute_rest_props, j as spread, k as escape_object, d as add_attribute, v as validate_component, m as missing_component, e as escape, l as add_classes, o as add_styles } from "../../chunks/index.js";
/* empty css                                                   */function _isPlaceholder(a) {
  return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
}
function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}
function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function(_b) {
          return fn(a, _b);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function(_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function(_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}
var omit = /* @__PURE__ */ _curry2(function omit2(names, obj) {
  var result = {};
  var index = {};
  var idx = 0;
  var len = names.length;
  while (idx < len) {
    index[names[idx]] = 1;
    idx += 1;
  }
  for (var prop in obj) {
    if (!index.hasOwnProperty(prop)) {
      result[prop] = obj[prop];
    }
  }
  return result;
});
const omit$1 = omit;
var pick = /* @__PURE__ */ _curry2(function pick2(names, obj) {
  var result = {};
  var idx = 0;
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]];
    }
    idx += 1;
  }
  return result;
});
const pick$1 = pick;
const InputColor = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "color" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputDate = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "date" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputDateTime = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "datetime-local" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputEmail = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "email" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputFile = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "file" }, escape_object($$restProps)], {})}>`;
});
const InputMonth = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "month" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputNumber = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "number" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputPassword = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "password" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputTel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "url" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputText = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "text" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputTime = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "time" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputUrl = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "url" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const InputWeek = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<input${spread([{ type: "week" }, escape_object($$restProps)], {})}${add_attribute("value", value, 0)}>`;
});
const TextArea = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value"]);
  let { value } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `<textarea${spread([{ type: "week" }, escape_object($$restProps)], {})}>${value || ""}</textarea>`;
});
const wrappedInput = {
  tel: InputTel,
  url: InputUrl,
  text: InputText,
  date: InputDate,
  time: InputTime,
  file: InputFile,
  week: InputWeek,
  month: InputMonth,
  email: InputEmail,
  color: InputColor,
  number: InputNumber,
  datetime: InputDateTime,
  password: InputPassword,
  textarea: TextArea
};
const Input = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value", "type"]);
  let { value } = $$props;
  let { type = "text" } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(wrappedInput[type] || missing_component, "svelte:component").$$render(
      $$result,
      Object.assign($$restProps, { value }),
      {
        value: ($$value) => {
          value = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const InputField = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let pass;
  let fail;
  let warn;
  let rootProps;
  let props;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "name",
    "label",
    "icon",
    "value",
    "type",
    "required",
    "status",
    "disabled",
    "message"
  ]);
  let { class: className = "" } = $$props;
  let { name } = $$props;
  let { label = null } = $$props;
  let { icon = null } = $$props;
  let { value } = $$props;
  let { type = "text" } = $$props;
  let { required = false } = $$props;
  let { status = "default" } = $$props;
  let { disabled = false } = $$props;
  let { message = null } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.message === void 0 && $$bindings.message && message !== void 0)
    $$bindings.message(message);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    pass = status === "pass";
    fail = status === "fail";
    warn = status === "warn";
    rootProps = pick$1(["id"], $$restProps);
    props = {
      required,
      readOnly: disabled,
      ...omit$1(["id"], $$restProps)
    };
    $$rendered = `<input-field${spread(
      [
        escape_object(rootProps),
        {
          class: "flex flex-col " + escape(className, true)
        }
      ],
      {
        classes: (disabled ? "disabled" : "") + " " + (pass ? "pass" : "") + " " + (fail ? "fail" : "") + " " + (warn ? "warn" : "") + " " + (!value ? "empty" : "")
      }
    )}><label${add_attribute("for", name, 0)}${add_classes((required ? "required" : "").trim())}>${escape(label)}</label>
	${icon ? `<field class="${"flex flex-row w-full items-center"}"><span class="${"flex flex-shrink-0 aspect-square items-center justify-center "}"><icon${add_attribute("class", icon, 0)}></icon></span>
			${validate_component(Input, "Input").$$render(
      $$result,
      Object.assign({ name }, { type }, props, { value }),
      {
        value: ($$value) => {
          value = $$value;
          $$settled = false;
        }
      },
      {}
    )}</field>` : `${validate_component(Input, "Input").$$render(
      $$result,
      Object.assign({ id: name }, { name }, { type }, props, { value }),
      {
        value: ($$value) => {
          value = $$value;
          $$settled = false;
        }
      },
      {}
    )}`}
	${message ? `<message${add_attribute("class", status, 0)}>${escape(message)}</message>` : ``}</input-field>`;
  } while (!$$settled);
  return $$rendered;
});
const GraphPaper_svelte_svelte_type_style_lang = "";
const css = {
  code: "graph-paper.svelte-16yaj5q{background-image:linear-gradient(\n				currentColor var(--thick),\n				transparent var(--thick)\n			),\n			linear-gradient(\n				90deg,\n				currentColor var(--thick),\n				transparent var(--thick)\n			),\n			linear-gradient(currentColor var(--thin), transparent var(--thin)),\n			linear-gradient(90deg, currentColor var(--thin), transparent var(--thin));background-size:var(--size) var(--size), var(--size) var(--size),\n			var(--unit) var(--unit), var(--unit) var(--unit);background-position:calc(-1 * var(--thin)) calc(-1 * var(--thin)),\n			calc(-1 * var(--thin)) calc(-1 * var(--thin)),\n			calc(-1 * var(--thin)) calc(-1 * var(--thin)),\n			calc(-1 * var(--thin)) calc(-1 * var(--thin))}",
  map: null
};
const GraphPaper = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { unit = ".5rem" } = $$props;
  let { group = 4 } = $$props;
  let { thickness = 0.5 } = $$props;
  if ($$props.unit === void 0 && $$bindings.unit && unit !== void 0)
    $$bindings.unit(unit);
  if ($$props.group === void 0 && $$bindings.group && group !== void 0)
    $$bindings.group(group);
  if ($$props.thickness === void 0 && $$bindings.thickness && thickness !== void 0)
    $$bindings.thickness(thickness);
  $$result.css.add(css);
  return `<graph-paper class="${"bg-skin-50 text-primary-300 p-8 border border-primary-400 svelte-16yaj5q"}"${add_styles({
    "--unit": unit,
    "--size": `calc( ${group} * ${unit})`,
    "--thin": `${thickness}px`,
    "--thick": `${2 * thickness}px`
  })}>${slots.default ? slots.default({}) : ``}
</graph-paper>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section class="${"flex flex-col flex-grow items-center justify-center"}">${validate_component(GraphPaper, "GraphPaper").$$render($$result, {}, {}, {
    default: () => {
      return `

		${validate_component(InputField, "InputField").$$render(
        $$result,
        {
          type: "text",
          label: "name",
          placeholder: "name",
          required: true,
          icon: "i-spice-palette"
        },
        {},
        {}
      )}`;
    }
  })}</section>
<section>description</section>`;
});
export {
  Page as default
};
