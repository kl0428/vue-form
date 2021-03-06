import { config } from '../config';

function findLabel (nodes) {
  if(!nodes) {
    return;
  }
  for (let i = 0; i < nodes.length; i++) {
    let vnode = nodes[i];
    if(vnode.tag === 'label') {
      return nodes[i];
    } else if (nodes[i].children) {
      return findLabel(nodes[i].children);
    }
  }
}

export default {
  render(h) {
    const children = [];
    const field = this.formstate[this.name];
    if (field && field.$error && this.isShown) {
      Object.keys(field.$error).forEach((key) => {
        if(this.$slots[key] || this.$scopedSlots[key]) {
          const out = this.$slots[key] || this.$scopedSlots[key](field);
          if(this.autoLabel) {
            const label = findLabel(out);
            if(label) {
              label.data = label.data || {};
              label.data.attrs = label.data.attrs || {};
              label.data.attrs.for = field._id;
            }
          }
          children.push(out);
        }
      });
      if(!children.length) {
        if(this.$slots.default || this.$scopedSlots.default) {
          const out = this.$slots.default || this.$scopedSlots.default(field);
          if(this.autoLabel) {
            const label = findLabel(out);
            if(label) {
              label.data = label.data || {};
              label.data.attrs = label.data.attrs || {};
              label.data.attrs.for = field._id;
            }
          }
          children.push(out);
        }
      }
    }
    return h(this.tag, children);
  },
  props: {
    state: Object,
    name: String,
    show: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: config.messagesTag
    },
    autoLabel: Boolean,
  },
  data() {
    return {
      formstate: {}
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.formstate = this.state || this.$parent.formstate || this.$parent.state;
    });
  },
  computed: {
    isShown() {
      const field = this.formstate[this.name];

      if (!this.show || !field) {
        return true;
      }

      const compare = (v) => {
        return field[v.trim()];
      };

      if (this.show.indexOf('&&') > -1) {
        // and logic - every
        const split = this.show.split('&&');
        return split.every(compare);
      } else if (this.show.indexOf('||') > -1) {
        // or logic - some
        const split = this.show.split('||');
        return split.some(compare);
      } else {
        // single
        return field[this.show];
      }
    }
  }
};
