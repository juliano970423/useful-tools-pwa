// MDUI組件類型聲明
declare module 'mdui' {
  export const version: string
}

// MDUI組件的全局類型聲明
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mdui-button': any
      'mdui-card': any
      'mdui-top-app-bar': any
      'mdui-top-app-bar-title': any
      'mdui-button-icon': any
      'mdui-linear-progress': any
      'mdui-dialog': any
      'mdui-divider': any
      'mdui-tooltip': any
      'mdui-snackbar': any
      'mdui-text-field': any
      'mdui-select': any
      'mdui-menu': any
      'mdui-menu-item': any
      'mdui-radio-group': any
      'mdui-radio': any
      'mdui-checkbox': any
      'mdui-switch': any
      'mdui-slider': any
      'mdui-range-slider': any
      'mdui-fab': any
      'mdui-chip': any
      'mdui-badge': any
      'mdui-avatar': any
      'mdui-icon': any
      'mdui-tabs': any
      'mdui-tab': any
      'mdui-tab-panel': any
      'mdui-collapse': any
      'mdui-collapse-item': any
      'mdui-list': any
      'mdui-list-item': any
      'mdui-list-subheader': any
      'mdui-navigation-bar': any
      'mdui-navigation-bar-item': any
      'mdui-navigation-rail': any
      'mdui-navigation-rail-item': any
      'mdui-navigation-drawer': any
      'mdui-bottom-app-bar': any
      'mdui-dropdown': any
      'mdui-segmented-button-group': any
      'mdui-segmented-button': any
      'mdui-circular-progress': any
    }
  }
}

export {}