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

const div = (name) => {
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

const divWith = (name, ...createElements) => {
    const d = div(name);
    createElements.forEach(e => d.appendChild(e()));
    return d;
};

const button = (name, onClick) => {
    const e = document.createElement('button');
    e.onclick = onClick;
    return e;
};

const textButton = (name, onClick) => {
    const e = button(name, onClick);
    e.textContent = name;
    return e;
};