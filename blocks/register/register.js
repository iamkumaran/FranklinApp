const DOMAIN =
  window.location.hostname === "localhost" ? "http://localhost:3300" : "";

const renderTemplate = (template, item) => {
  // const templateElem = document.getElementById(templateID).cloneNode(true);
  const templateElem = template;
  let htmlStr = "";
  if (templateElem) {
    // htmlStr = templateElem.innerHTML;
    htmlStr = templateElem;
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(item)) {
      const regex = new RegExp(`{${key}}`, "gi");
      htmlStr = htmlStr.replace(regex, value ?? "");
    }
  }
  return htmlStr;
};

const getFields = (fields) => {
  const arr = fields.map((obj) => {
    const template = `<div class="cmp-search__field">
            <label for="{Name}">{Label}</label>
            <input class="cmp-search__input" type="{Type}" id="{Name}" name="{Name}" placeholder="{Placeholder}" />
        </div>`;
    return renderTemplate(template, obj);
  });
  return arr.join("");
};

const constructPayload = (form) => {
  const formData = new FormData(form);
  return JSON.stringify({
    ...Object.fromEntries(formData),
    ...{ timestamp: new Date().toJSON() },
  });
};

async function submitForm(form) {
  const payload = constructPayload(form);
  const resp = await fetch(form.getAttribute("action"), {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

const createHTML = (fields) => {
  const template = `
    <form class="registration-form" class="cmp-search__form" method="post"
        action="${DOMAIN}/forms"
        autocomplete="off">
        ${getFields(fields)}
        <div><button type="reset">Reset</button><button type="submit">Register</button></div>
    </form>`;
  return template;
};

const createForm = async () => {
  const req = await fetch(`${DOMAIN}/forms.json?sheet=register-form`);
  const resp = await req.json();
  if (resp?.total && resp?.data?.length) {
    return createHTML(resp?.data || []);
    //   document.querySelector('.search-form').innerHTML = formHTML;
  }
};

export default function decorate(block) {
  createForm().then((html) => {
    block.innerHTML = html;
    block.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(block.querySelector("form"))
        .then(() => {
          alert("Form Saved");
        })
        .catch((err) => {
          console.error("Form Failed", err);
          alert("Some thing went wrong...");
        });
    });
  });
}
