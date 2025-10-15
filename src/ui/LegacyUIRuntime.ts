import type { UIWindowSummary, UIWindowControlGroup } from '../types';

export interface RenderOptions {
  width?: number;
  height?: number;
}

export class LegacyUIRuntime {
  render(container: HTMLElement, windowSummary: UIWindowSummary, options: RenderOptions = {}) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'legacy-ui__wrapper';
    wrapper.style.width = `${options.width ?? windowSummary.size.w ?? 400}px`;
    wrapper.style.height = `${options.height ?? windowSummary.size.h ?? 300}px`;

    const title = document.createElement('div');
    title.className = 'legacy-ui__title';
    title.textContent = `${windowSummary.id} (${windowSummary.file})`;
    wrapper.appendChild(title);

    const surface = document.createElement('div');
    surface.className = 'legacy-ui__surface';
    wrapper.appendChild(surface);

    windowSummary.controlTypes.forEach((group) => {
      const block = this.renderControlGroup(group);
      surface.appendChild(block);
    });

    container.appendChild(wrapper);
  }

  private renderControlGroup(group: UIWindowControlGroup): HTMLElement {
    const groupEl = document.createElement('section');
    groupEl.className = 'legacy-ui__group';
    const header = document.createElement('h5');
    header.textContent = `${group.type} (${group.count})`;
    groupEl.appendChild(header);

    (group.samples ?? []).forEach((sample) => {
      const sampleEl = document.createElement('div');
      sampleEl.className = 'legacy-ui__sample';
      sampleEl.textContent = sample.id || '(ohne id)';
      const meta = document.createElement('small');
      meta.textContent = `${sample.size.w ?? '—'}×${sample.size.h ?? '—'} · ${sample.desc || ''}`;
      sampleEl.appendChild(meta);
      groupEl.appendChild(sampleEl);
    });

    return groupEl;
  }
}
