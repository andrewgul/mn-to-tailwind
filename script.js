const Input = document.getElementById("input");
const Button = document.getElementById("button");
const Reset = document.getElementById("reset");
const Result = document.getElementById("result");
const ResultTitle = document.getElementById("result-title");
const Copy = document.getElementById("copy");
const Missing = document.getElementById("missing");
const MissingTitle = document.getElementById("missing-title");
const Snackbar = document.getElementById("snackbar");
const Available = document.getElementById("available");

let resultForCopying = "";

function from1ToN(from, to, n = 64) {
  const numbers = Array.from({ length: n }, (_, index) => index + 1);

  return numbers.reduce(
    (acc, val) => ({
      ...acc,
      [from(val)]: to(val),
    }),
    {}
  );
}

function from1ToNTemplate(from, to = from) {
  return from1ToN(
    (n) => `${from}${n}`,
    (n) => `${to}-[${n}px]`
  );
}

function convertColors(names) {
  return names.reduce(
    (acc, name) => ({
      ...acc,
      [`c--vkui--color_${name}`]: `text-(--vkui--color_${name})`,
    }),
    {}
  );
}

function convertBg(names) {
  return names.reduce(
    (acc, name) => ({
      ...acc,
      [`bg--vkui--color_${name}`]: `bg-(--vkui--color_${name})`,
    }),
    {}
  );
}

function convertBorderColor(names) {
  return names.reduce(
    (acc, name) => ({
      ...acc,
      [`bc--vkui--color_${name}`]: `border-(--vkui--color_${name})`,
    }),
    {}
  );
}

const ALL_COLORS = [
  "text_primary",
  "text_subhead",
  "text_secondary",
  "text_contrast",
  "icon_accent",
  "icon_medium",
  "background_content",
  "overlay_primary",
  "icon_medium",
  "image_border_alpha",
];

const MN_TO_TAILWIND_MAP = {
  abs: "absolute",
  rlv: "relative",
  dF: "flex",
  aiC: "items-center",
  jcC: "justify-center",
  jcSB: "justify-between",
  fxdC: "flex-col",
  r8: "rounded-[8px]",
  p4_6: "p-[4px_6px]",
  fw4: "font-[400]",
  fw5: "font-[500]",
  fw6: "font-[600]",
  "lts1.5px": "tracking-[1.5px]",
  "lts-0.18px": "lts-[-0.18px]",
  dB: "block",
  sq: "size-full",
  ofCover: "object-cover",
  w: "w-full",
  wbKeepAll: "break-keep",
  dGrid: "grid",
  fx1: "flex-1",
  bxz: "box-border",
  cr: "cursor-pointer",
  crP: "cursor-pointer",
  olN: "outline-none",
  dI: "inline",
  fxs0: "shrink-0",
  ov: "overflow-hidden",
  s: "inset-0",
  wFitContent: "w-fit",
  rz180: "rotate-z-180",
  dn300: "duration-300",
  ...convertColors(ALL_COLORS),
  ...convertBg(ALL_COLORS),
  ...from1ToNTemplate("lh", "leading"),
  ...from1ToNTemplate("f", "text"),
  ...from1ToNTemplate("sb", "bottom"),
  ...from1ToNTemplate("st", "top"),
  ...from1ToNTemplate("sr", "right"),
  ...from1ToNTemplate("sl", "left"),
  ...from1ToNTemplate("pb"),
  ...from1ToNTemplate("pt"),
  ...from1ToNTemplate("pl"),
  ...from1ToNTemplate("pr"),
  ...from1ToNTemplate("pv", "py"),
  ...from1ToNTemplate("ph", "px"),
  ...from1ToNTemplate("p"),
  ...from1ToNTemplate("mb"),
  ...from1ToNTemplate("mt"),
  ...from1ToNTemplate("ml"),
  ...from1ToNTemplate("mr"),
  ...from1ToNTemplate("mv", "my"),
  ...from1ToNTemplate("mh", "mx"),
  ...from1ToNTemplate("m"),
  ...from1ToNTemplate("gap"),
  ...from1ToNTemplate("h"),
  ...from1ToNTemplate("r", "rounded"),
  ...from1ToNTemplate("hmin", "min-h", 300),
  ...from1ToNTemplate("wmin", "min-w", 300),
  ...from1ToNTemplate("w", "w", 500),
  ...from1ToNTemplate("h", "h", 500),
  ...from1ToN(
    (n) => `z${n}`,
    (n) => `z-${n}`
  ),
};

function hideSnackbar() {
  if (Snackbar) {
    Snackbar.style.opacity = 0;

    setTimeout(() => {
      Snackbar.innerHTML = "";
      Snackbar.style.display = "none";
    }, 200);
  }
}

function showSnackbar(text, { duration = 1000 } = {}) {
  if (Snackbar) {
    Snackbar.style.display = "block";
    Snackbar.innerHTML = text;

    setTimeout(() => {
      Snackbar.style.opacity = 1;
    }, 10);

    setTimeout(() => {
      hideSnackbar();
    }, duration);
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showSnackbar("Скопировано 📄");
  } catch {
    showSnackbar("Не получилось скопировать 😭");
  }
}

function createHint(item, hint) {
  return `${item} <span class="missing-hint">(${hint})</span>`;
}

function tryToFindHintForMissing(item) {
  if (item.startsWith("c")) {
    return createHint(
      item,
      "Возможно это цвет текста, что-то типа cABCDEF (сolor: #ABCDEF)? Если так, то нужен text-[#ABCDEF]"
    );
  }

  if (item.startsWith("ff")) {
    return createHint(
      item,
      "Возможно это font-family, что-то типа ff_Roboto, лучше обработать вручную"
    );
  }

  if (item.startsWith("p")) {
    return createHint(
      item,
      "Возможно это паддинги (p1_25_67), тогда надо переделать в p-[1px_25px_67px] (добавить тире, квадратные скобки и px)"
    );
  }

  return item;
}

function showMissing(missing) {
  if (Missing && missing.length > 0) {
    Missing.innerHTML = missing
      .map((item) => `<li>■ ${tryToFindHintForMissing(item)}</li>`)
      .join("");

    if (MissingTitle) {
      MissingTitle.innerHTML = "⚠️ Не найдены классы:";
    }
  }
}

function showResult(result) {
  if (Result && Array.isArray(result)) {
    resultForCopying = result.map(({ className }) => className).join(" ");

    Result.innerHTML = result
      .map(
        (item) =>
          `<span class="item ${item.found ? "found" : "not-found"}">${
            item.className
          }</span>`
      )
      .join(" ");

    showCopy();

    if (ResultTitle) {
      ResultTitle.innerHTML = "🌀 Результат";
    }
  }
}

function reset() {
  resultForCopying = "";
  hideCopy();

  [Result, Missing, MissingTitle, ResultTitle].forEach((node) => {
    if (node) {
      node.innerHTML = "";
    }
  });
}

function hideCopy() {
  if (Copy) {
    Copy.style.display = "none";
  }
}

function showCopy() {
  if (Copy) {
    Copy.style.display = "inline";
  }
}

function process(classNames) {
  reset();

  let missing = [];

  try {
    const asArray = classNames.split(" ");

    const transformed = asArray.map((classNameMN) => {
      const found = MN_TO_TAILWIND_MAP[classNameMN];

      if (found) {
        return {
          found: true,
          className: found,
          ex: classNameMN,
        };
      }

      missing.push(classNameMN);

      return {
        found: false,
        className: classNameMN,
      };
    });

    showMissing(missing);
    showResult(transformed);
  } catch (error) {
    // @todo
  }
}

Button.addEventListener("click", () => {
  const value = Input?.value;

  if (value) {
    process(value);
  }
});

Reset.addEventListener("click", () => {
  reset();
});

Copy.addEventListener("click", () => {
  copyToClipboard(resultForCopying);
});
