import { ro } from "./ro";

export type Messages = typeof ro;

/** Default locale — swap to `en` when i18n switch is added */
export function getMessages(): Messages {
  return ro;
}
