const none = false;

const header = (createElement) => {
    const e = document.createElement('header');
    e.appendChild(createElement());
    return e;
};

const h1 = (text) => {
    const e = document.createElement('h1');
    e.textContent = text;
    return e;
};

const h2 = (text) => {
    const e = document.createElement('h2');
    e.textContent = text;
    return e;
};

const h3 = (text) => {
    const e = document.createElement('h3');
    e.textContent = text;
    return e;
};

const div = (name, doNotUse) => {
    if (!!doNotUse)
        throw new Error(`Unexpected child element for div ${name}`);
    const e = document.createElement('div');
    e.classList.add(name);
    return e;
};

const p = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
};

const img = (name) => {
    const e = document.createElement('img');
    e.src = name;
    return e;
};

const table = (name, ...tr) => {
    const e = document.createElement('table');
    e.classList.add(name);
    tr.forEach(r => e.appendChild(r));
    return e;
};

const tr = (...td) => {
    const e = document.createElement('tr');
    td.forEach(x => e.appendChild(x));
    return e;
};

const td = (data) => {
    const e = document.createElement('td');
    e.textContent = data.toString();
    return e;
};

const divWith = (name, ...createElements) => withChildren(div(name), ...createElements);

const withChildren = (parent, ...createElements) => {
    createElements.forEach(e => {
        const element = e();
        if (element !== none)
            parent.appendChild(element)
    });
    return parent;
};


const rowWith = (name, ...createElements) => {
    const d = div(name);
    d.classList.add('row');
    return withChildren(d, ...createElements);
};

const flexWith = (name, ...createElements) => {
    const d = div(name);
    d.classList.add('flex');
    return withChildren(d, ...createElements);
};

const columnWith = (name, ...createElements) => {
    const d = div(name);
    d.classList.add('column');
    return withChildren(d, ...createElements);
};

const button = (name, className, onClick) => {
    const e = document.createElement('button');
    e.classList.add(className);
    e.onclick = onClick;
    return e;
};

const imageButton = (imgName, className, onClick) => {
    const e = document.createElement('button');
    e.classList.add(className);
    e.onclick = onClick;
    e.style.backgroundImage = `url(${imgName})`;
    return e;
};

const textButton = (name, className, onClick) => {
    const e = button(name, className, onClick);
    e.textContent = name;
    return e;
};

const styled = (elem, style) => {
    elem.style = style;
    return elem;
};

const withClass = (elem, className) => {
    if (!!className)
        throw new Error('Undefined className');
    elem.classList.add(className);
    return elem;
};
