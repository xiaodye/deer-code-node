import process from 'process';
import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatOpenAI } from '@langchain/openai';
import { getConfigSection } from '../config/config';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export function initChatModel(): BaseChatModel {
  const settings = getConfigSection(["models", "chat_model"]);
  if (!settings) {
    throw new Error("The `models/chat_model` section in `config.yaml` is not found");
  }

  let modelName = settings.model;
  if (!modelName) {
    throw new Error("The `model` in `config.yaml` is not found");
  }

  let apiKey = settings.api_key;
  if (!apiKey) {
    apiKey = process.env.OPENAI_API_KEY;
  } else if (apiKey.startsWith("$")) {
    apiKey = process.env[apiKey.slice(1)];
  }

  const restSettings = { ...settings };
  delete restSettings.model;
  delete restSettings.api_key;
  
  if (settings.type === "deepseek" || settings.type === "doubao") {
    delete restSettings.type;
    return new ChatDeepSeek({
      model: modelName,
      apiKey: apiKey,
      ...restSettings
    });
  } else {
    if (restSettings.type) {
      delete restSettings.type;
    }
    return new ChatOpenAI({
      model: modelName,
      apiKey: apiKey,
      ...restSettings
    });
  }
}
