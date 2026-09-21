import { expect, screen, waitFor } from 'storybook/test';

/**
 * Shared accessibility assertions for story `play` functions.
 *
 * Storybook-only (`*.docs.*` is excluded from the published build and from
 * the release/changelog checks), and shared rather than copy-pasted because
 * `Modal`, `Drawer` and `CommandPalette` need the same ~50 lines. Three
 * copies of an assertion is how one of them quietly stops asserting.
 */

type UserEvent = {
  click: (element: Element) => Promise<void>;
  tab: (options?: { shift?: boolean }) => Promise<void>;
  keyboard: (keys: string) => Promise<void>;
};

export interface FocusTrapExpectation {
  /** The `userEvent` given to the `play` function. */
  userEvent: UserEvent;
  /**
   * `step` from the `play` context, so the Interactions panel stays readable.
   *
   * Returns `void | Promise<void>` to match Storybook's own `StepFunction` -
   * narrowing it to `Promise<void>` here does not typecheck at the call site.
   */
  step: (label: string, run: () => Promise<void>) => void | Promise<void>;
  /** The control that opens the overlay. Focus must come back here on close. */
  trigger: HTMLElement;
  /**
   * How the overlay is found once open. Queried with `screen`, not `canvas`:
   * these overlays portal to `document.body`, which is outside the story root.
   */
  dialogName?: string | RegExp;
  /** How many Tab presses to make in each direction. */
  cycles?: number;
  /** Set false for overlays that do not close on Escape. */
  closesOnEscape?: boolean;
  /**
   * Whether Tab is expected to be confined to the dialog.
   *
   * `false` for a non-modal dialog (`aria-modal="false"`), where the test
   * asserts the opposite - that focus *can* leave - because trapping a
   * non-modal dialog would strand the user on the rest of the page.
   */
  trapped?: boolean;
}

/**
 * Asserts the four properties that make `aria-modal="true"` an honest claim:
 * focus enters on open, Tab and Shift+Tab both stay inside, and focus returns
 * to the trigger on close.
 *
 * All four failed on every overlay in this library before the focus trap
 * existed, and none of them is visible to axe.
 */
export const expectFocusTrap = async ({
  userEvent,
  step,
  trigger,
  dialogName,
  cycles = 8,
  closesOnEscape = true,
  trapped = true,
}: FocusTrapExpectation): Promise<void> => {
  const findDialog = () =>
    dialogName ? screen.getByRole('dialog', { name: dialogName }) : screen.getByRole('dialog');

  await step('moves focus into the dialog on open', async () => {
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await waitFor(() =>
      expect(findDialog().contains(document.activeElement), 'focus never entered the dialog').toBe(
        true,
      ),
    );
  });

  if (trapped) {
    await step(`keeps Tab inside the dialog (${cycles} presses)`, async () => {
      const dialog = findDialog();
      for (let press = 1; press <= cycles; press++) {
        await userEvent.tab();
        expect(
          dialog.contains(document.activeElement),
          `focus escaped the dialog on Tab #${press}`,
        ).toBe(true);
      }
    });

    await step(`keeps Shift+Tab inside the dialog (${cycles} presses)`, async () => {
      const dialog = findDialog();
      for (let press = 1; press <= cycles; press++) {
        await userEvent.tab({ shift: true });
        expect(
          dialog.contains(document.activeElement),
          `focus escaped the dialog on Shift+Tab #${press}`,
        ).toBe(true);
      }
    });
  } else {
    await step('lets Tab leave the dialog (non-modal)', async () => {
      const dialog = findDialog();
      let escaped = false;
      for (let press = 1; press <= cycles && !escaped; press++) {
        await userEvent.tab();
        escaped = !dialog.contains(document.activeElement);
      }
      expect(
        escaped,
        `focus never left the dialog in ${cycles} presses - a non-modal dialog must not trap it`,
      ).toBe(true);
    });
  }

  if (!closesOnEscape) return;

  await step('returns focus to the trigger on close', async () => {
    await userEvent.keyboard('{Escape}');
    // Not `waitForElementToBeRemoved`: it throws if the element has *already*
    // gone, and these overlays unmount at different speeds - Modal and Drawer
    // linger for their 200/300ms exit transition, CommandPalette does not, so
    // the same helper passed for two components and errored for the third.
    // Polling for absence is agnostic to how fast the exit animation is.
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(document.activeElement, 'focus was not returned to the trigger').toBe(trigger),
    );
  });
};

/**
 * Asserts that a field in an error state says so *programmatically*, not
 * only visually.
 *
 * Shared because eight components take an `error` prop and every one of them
 * has to satisfy the same three conditions. None of it is visible to axe:
 * a red border with an unassociated message beside it is a perfectly valid
 * DOM, and also a SC 3.3.1 (Error Identification, Level A) failure - a
 * screen reader user is told nothing at all.
 *
 * @param field       the control itself, e.g. `canvas.getByRole('textbox')`
 * @param errorText   the message the component was given
 */
export const expectErrorWiring = async (field: HTMLElement, errorText: string): Promise<void> => {
  expect(field, 'the field is not marked invalid (aria-invalid)').toHaveAttribute(
    'aria-invalid',
    'true',
  );

  const describedBy = field.getAttribute('aria-describedby');
  expect(describedBy, 'the field does not point at any description').toBeTruthy();

  // `aria-describedby` takes a *list* of ids, so a component that adds a hint
  // and an error must keep both - resolving every id is what catches one
  // silently overwriting the other.
  const described = describedBy!
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');

  expect(described, `the description does not contain the error text "${errorText}"`).toContain(
    errorText,
  );
};
