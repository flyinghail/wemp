import prompt from 'electron-prompt';

const options = {
  type: 'input',
  width: 500,
  height: 200,
  alwaysOnTop: true
};

export function inputPrompt(title, label, placeholder) {
  options.title = title;
  options.label = label;
  options.inputAttrs = {
    placeholder
  };

  return prompt(options);
}
