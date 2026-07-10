// Drop-in async replacements for window.prompt/confirm/alert, rendered as
// in-app modals by components/ui/DialogHost instead of native browser dialogs.
import { useDialogStore } from '@/store/dialogStore';

export function promptDialog(message, defaultValue = '') {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ type: 'prompt', message, defaultValue, resolve });
  });
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ type: 'confirm', message, resolve });
  });
}

export function alertDialog(message) {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ type: 'alert', message, resolve });
  });
}
