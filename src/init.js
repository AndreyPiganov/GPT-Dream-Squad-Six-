import i18next from 'i18next';

import _ from 'lodash';

import Messages from './components/Messages.js';

import { sendMessage } from './server.js';

import resources from './locales/index.js';

import enImage from '../assets/images/favicon-e-32x32.png';

import ruImage from '../assets/images/favicon-ru-32x32.png';

const app = async () => {
  const state = {
    lang: 'en',
    history: [],
  };

  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: state.lang,
    resources,
  });
  // eslint-disable-next-line max-len
  //-------------------------------------------------------------------------------------------------

  const { body } = document;
  const output = document.querySelector('#output');
  const input = document.querySelector('textarea');
  const title = document.querySelector('h1');
  const trash = document.querySelector('.trash');
  const list = document.querySelector('.chat-list');
  const p = document.querySelector('#inf');
  const info = document.querySelector('.info');
  const submitButton = document.querySelector('.btn-submit');
  const addButton = document.querySelector('.add-chat');
  const regenerateButton = document.querySelector('.response');
  const languageButton = document.querySelector('.theme-toggle');
  const form = document.querySelector('form');
  const toggle = document.querySelector('.theme');
  const language = document.querySelector('.theme-toggle');

  languageButton.insertAdjacentHTML('afterbegin', `<img src=${enImage} alt="en">`);

  // eslint-disable-next-line max-len
  //-------------------------------------------------------------------------------------------------
  const finderMessage = (id) => {
    const result = state.history.find((message) => message.id === id);
    return result;
  };
  // eslint-disable-next-line max-len
  //-------------------------------------------------------------------------------------------------
  // eslint-disable-next-line no-shadow
  const renderChats = (list, name = '') => {
    const ol = document.createElement('ol');
    const li = document.createElement('li');
    const a = document.createElement('a');
    const id = _.uniqueId();
    const myName = name.trim().length >= 22 && name !== null ? `${name.trim().slice(0, 22)}...` : name;
    a.textContent = name === '' ? i18nextInstance.t('addChat') : myName;
    ol.classList.add('btn', 'no-marker', 'active-chat');
    ol.id = id;
    li.classList.add('list-item');
    li.appendChild(a);
    ol.appendChild(li);
    list.prepend(ol);
  };
    // eslint-disable-next-line max-len
    // ----------------------------------------------------------------------------------------------
  const submitForm = async (value) => {
    if (list.children.length === 0) {
      renderChats(list, value);
    }
    const div = document.createElement('div');
    // eslint-disable-next-line no-shadow
    const p = document.createElement('p');
    const activeChat = document.querySelector('.active-chat');
    const activeElement = activeChat.querySelector('li > a');
    if (activeElement.textContent === 'New Chat' || activeElement.textContent === 'Новый чат') {
      const myValue = value.trim().length >= 22 ? `${value.trim().slice(0, 22)}...` : value.trim();
      activeElement.textContent = myValue.trim();
    }
    const { id } = activeChat;
    const messages = finderMessage(id) === undefined ? new Messages() : finderMessage(id);
    if (messages.id === 'none') {
      messages.generateId(id);
      state.history.push(messages);
    }
    messages.add('user', value);
    const send = await sendMessage(messages);
    messages.add('assistant', send);
    p.textContent = send;
    div.textContent = value;
    div.classList.add('user-message');
    p.classList.add('assistant-message');
    output.appendChild(div);
    output.appendChild(p);
    title.remove();
    form.reset();
    input.focus();
  };
  // eslint-disable-next-line max-len
  //-------------------------------------------------------------------------------------------------

  const changeLang = async (lang) => {
    await i18nextInstance.changeLanguage(lang);
  };

  // dark - light mode knopka
  toggle.addEventListener('click', (event) => {
    const elementSection = document.querySelector('.main').querySelectorAll('*');
    const myEvent = event;
    if (myEvent.target.classList.contains('dark-mode')) {
      body.classList.remove('body-black');
      body.classList.add('body-white');
      myEvent.target.classList.remove('dark-mode');
      myEvent.target.classList.add('light-mode');
      myEvent.target.name = 'themeDark';
      myEvent.target.textContent = i18nextInstance.t('themeDark');
      elementSection.forEach((element) => {
        const copyElement = element;
        copyElement.style.color = 'black';
      });
    } else {
      myEvent.target.classList.remove('light-mode');
      myEvent.target.classList.add('dark-mode');
      body.classList.remove('body-white');
      body.classList.add('body-black');
      myEvent.target.name = 'themeLight';
      myEvent.target.textContent = i18nextInstance.t('themeLight');
      elementSection.forEach((element) => {
        const copyElement = element;
        copyElement.style.color = 'white';
      });
    }
  });
  // ----------------------------------------------------------------------------------------------

  // re - e flag knopka
  language.addEventListener('click', (event) => {
    const myEvent = event;
    if (state.lang === 'en') {
      myEvent.target.src = ruImage;
      myEvent.alt = 'ru';
      state.lang = 'ru';
    } else {
      myEvent.target.src = enImage;
      myEvent.alt = 'en';
      state.lang = 'en';
    }
    changeLang(state.lang);
    addButton.textContent = i18nextInstance.t('addChat');
    regenerateButton.textContent = i18nextInstance.t('reset');
    toggle.textContent = i18nextInstance.t(toggle.name);
    info.textContent = i18nextInstance.t('info');
    p.textContent = i18nextInstance.t('inf');
    title.textContent = i18nextInstance.t('title');
    trash.textContent = i18nextInstance.t('trash');
  });
  // ---------------------------------------------------------------
  trash.addEventListener('click', () => {
    list.innerHTML = '';
  });

  // ---------------------------------------------------------------

  submitButton.addEventListener('click', () => {
  // eslint-disable-next-line no-alert
    alert('я отправляю запрос');
  });
  // ---------------------------------------------------------------

  addButton.addEventListener('click', () => {
    output.innerHTML = '';
    const olAll = document.querySelectorAll('ol');
    olAll.forEach((ol) => {
      ol.classList.remove('active-chat');
    });
    renderChats(list);
    console.log(state.history);
  });

  // ---------------------------------------------------------------

  regenerateButton.addEventListener('click', () => {
  // eslint-disable-next-line no-alert
    alert('Переделываю запрос');
  });
  // ---------------------------------------------------------------

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const object = Object.fromEntries(formData);
    submitForm(object.input);
  });

  // ---------------------------------------------------------------

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitForm(event.target.value);
    }
  });

  form.reset();
  input.focus();
};
export default app;
