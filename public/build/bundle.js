
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    /* src/_atoms/Block.svelte generated by Svelte v3.29.0 */

    const file = "src/_atoms/Block.svelte";

    function create_fragment(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "block svelte-sb1p8g");
    			attr_dev(div, "style", div_style_value = `height: ${/*height*/ ctx[0]}; ${/*style*/ ctx[2] ? /*style*/ ctx[2] : ""}`);
    			toggle_class(div, "block--primary", /*primary*/ ctx[1]);
    			add_location(div, file, 15, 0, 370);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*height, style*/ 5 && div_style_value !== (div_style_value = `height: ${/*height*/ ctx[0]}; ${/*style*/ ctx[2] ? /*style*/ ctx[2] : ""}`)) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty & /*primary*/ 2) {
    				toggle_class(div, "block--primary", /*primary*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Block", slots, ['default']);
    	let { height = "auto" } = $$props;
    	let { primary = false } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["height", "primary", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Block> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("primary" in $$props) $$invalidate(1, primary = $$props.primary);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ height, primary, style });

    	$$self.$inject_state = $$props => {
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("primary" in $$props) $$invalidate(1, primary = $$props.primary);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [height, primary, style, $$scope, slots];
    }

    class Block extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { height: 0, primary: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Block",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get height() {
    		throw new Error("<Block>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Block>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Block>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Block>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Block>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Block>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/Card.svelte generated by Svelte v3.29.0 */

    const file$1 = "src/_atoms/Card.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card svelte-cuvgh6");
    			attr_dev(div, "style", /*style*/ ctx[4]);
    			toggle_class(div, "card--low", /*low*/ ctx[0]);
    			toggle_class(div, "card--relative", /*relative*/ ctx[1]);
    			toggle_class(div, "card--inline", /*inline*/ ctx[2]);
    			toggle_class(div, "card--center", /*center*/ ctx[3]);
    			add_location(div, file$1, 28, 0, 754);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*style*/ 16) {
    				attr_dev(div, "style", /*style*/ ctx[4]);
    			}

    			if (dirty & /*low*/ 1) {
    				toggle_class(div, "card--low", /*low*/ ctx[0]);
    			}

    			if (dirty & /*relative*/ 2) {
    				toggle_class(div, "card--relative", /*relative*/ ctx[1]);
    			}

    			if (dirty & /*inline*/ 4) {
    				toggle_class(div, "card--inline", /*inline*/ ctx[2]);
    			}

    			if (dirty & /*center*/ 8) {
    				toggle_class(div, "card--center", /*center*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['default']);
    	let { low = false } = $$props;
    	let { relative = false } = $$props;
    	let { inline = false } = $$props;
    	let { center = false } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["low", "relative", "inline", "center", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("low" in $$props) $$invalidate(0, low = $$props.low);
    		if ("relative" in $$props) $$invalidate(1, relative = $$props.relative);
    		if ("inline" in $$props) $$invalidate(2, inline = $$props.inline);
    		if ("center" in $$props) $$invalidate(3, center = $$props.center);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ low, relative, inline, center, style });

    	$$self.$inject_state = $$props => {
    		if ("low" in $$props) $$invalidate(0, low = $$props.low);
    		if ("relative" in $$props) $$invalidate(1, relative = $$props.relative);
    		if ("inline" in $$props) $$invalidate(2, inline = $$props.inline);
    		if ("center" in $$props) $$invalidate(3, center = $$props.center);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [low, relative, inline, center, style, $$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			low: 0,
    			relative: 1,
    			inline: 2,
    			center: 3,
    			style: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get low() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set low(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get relative() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set relative(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/MapFrame.svelte generated by Svelte v3.29.0 */
    const file$2 = "src/_atoms/MapFrame.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "mapid");
    			attr_dev(div, "style", div_style_value = `width: ${/*width*/ ctx[0]}; height: ${/*height*/ ctx[1]}`);
    			add_location(div, file$2, 36, 0, 1069);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width, height*/ 3 && div_style_value !== (div_style_value = `width: ${/*width*/ ctx[0]}; height: ${/*height*/ ctx[1]}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MapFrame", slots, []);
    	let { width = "100%" } = $$props;
    	let { height = "100%" } = $$props;
    	const initialView = [51.5128, -0.1495];
    	let token = "pk.eyJ1IjoibTg3d2hlZWxlciIsImEiOiJja2c2dnMycmUwMWV1MnJsMWY0aHF1ZHprIn0.5BWusW01DG0yz7BO19rC-Q";

    	const createMap = container => {
    		let m = L.map(container, { preferCanvas: true }).setView(initialView, 20);

    		L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    			attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    			maxZoom: 18,
    			id: "mapbox/streets-v11",
    			tileSize: 512,
    			zoomOffset: -1,
    			accessToken: token
    		}).addTo(m);

    		let marker = L.marker([51.5128, -0.1495]).addTo(m);
    		return m;
    	};

    	onMount(() => {
    		createMap("mapid");
    	});

    	const writable_props = ["width", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MapFrame> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		width,
    		height,
    		initialView,
    		token,
    		createMap
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("token" in $$props) token = $$props.token;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, height];
    }

    class MapFrame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { width: 0, height: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapFrame",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get width() {
    		throw new Error("<MapFrame>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<MapFrame>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<MapFrame>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<MapFrame>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/_atoms/ParallaxImage.svelte generated by Svelte v3.29.0 */
    const file$3 = "src/_atoms/ParallaxImage.svelte";

    // (47:2) {#if visible}
    function create_if_block(ctx) {
    	let p;
    	let p_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if (default_slot) default_slot.c();
    			attr_dev(p, "class", "svelte-nle4uc");
    			add_location(p, file$3, 47, 4, 1081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, fly, { y: 200, duration: 2000 }, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!p_transition) p_transition = create_bidirectional_transition(p, fly, { y: 200, duration: 2000 }, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(47:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t;
    	let current;
    	let if_block = /*visible*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "img svelte-nle4uc");
    			attr_dev(div0, "style", div0_style_value = `background-image: url(${/*src*/ ctx[0]})`);
    			add_location(div0, file$3, 45, 2, 1001);
    			attr_dev(div1, "class", "wrapper svelte-nle4uc");
    			add_location(div1, file$3, 44, 0, 957);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			if (if_block) if_block.m(div1, null);
    			/*div1_binding*/ ctx[5](div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*src*/ 1 && div0_style_value !== (div0_style_value = `background-image: url(${/*src*/ ctx[0]})`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (/*visible*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			/*div1_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ParallaxImage", slots, ['default']);
    	let { src } = $$props;
    	let element;
    	let visible = false;

    	const startFlyIn = elem => {
    		elem.getBoundingClientRect().top < window.innerHeight
    		? $$invalidate(2, visible = true)
    		: null;
    	};

    	onMount(() => {
    		setTimeout(
    			() => {
    				startFlyIn(element);
    			},
    			500
    		);
    	});

    	const writable_props = ["src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ParallaxImage> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		onMount,
    		src,
    		element,
    		visible,
    		startFlyIn
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("element" in $$props) $$invalidate(1, element = $$props.element);
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, element, visible, $$scope, slots, div1_binding];
    }

    class ParallaxImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { src: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ParallaxImage",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<ParallaxImage> was created without expected prop 'src'");
    		}
    	}

    	get src() {
    		throw new Error("<ParallaxImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<ParallaxImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/Title.svelte generated by Svelte v3.29.0 */

    const file$4 = "src/_atoms/Title.svelte";

    // (50:24) 
    function create_if_block_5(ctx) {
    	let h6;
    	let h6_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			if (default_slot) default_slot.c();
    			attr_dev(h6, "class", h6_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"));
    			attr_dev(h6, "style", /*style*/ ctx[2]);
    			toggle_class(h6, "title--upper", /*upper*/ ctx[1]);
    			add_location(h6, file$4, 50, 2, 1300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);

    			if (default_slot) {
    				default_slot.m(h6, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && h6_class_value !== (h6_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"))) {
    				attr_dev(h6, "class", h6_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(h6, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*type, upper*/ 3) {
    				toggle_class(h6, "title--upper", /*upper*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(50:24) ",
    		ctx
    	});

    	return block;
    }

    // (46:24) 
    function create_if_block_4(ctx) {
    	let h5;
    	let h5_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			if (default_slot) default_slot.c();
    			attr_dev(h5, "class", h5_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"));
    			attr_dev(h5, "style", /*style*/ ctx[2]);
    			toggle_class(h5, "title--upper", /*upper*/ ctx[1]);
    			add_location(h5, file$4, 46, 2, 1181);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);

    			if (default_slot) {
    				default_slot.m(h5, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && h5_class_value !== (h5_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"))) {
    				attr_dev(h5, "class", h5_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(h5, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*type, upper*/ 3) {
    				toggle_class(h5, "title--upper", /*upper*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(46:24) ",
    		ctx
    	});

    	return block;
    }

    // (42:24) 
    function create_if_block_3(ctx) {
    	let h4;
    	let h4_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			if (default_slot) default_slot.c();
    			attr_dev(h4, "class", h4_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"));
    			attr_dev(h4, "style", /*style*/ ctx[2]);
    			toggle_class(h4, "title--upper", /*upper*/ ctx[1]);
    			add_location(h4, file$4, 42, 2, 1062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);

    			if (default_slot) {
    				default_slot.m(h4, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && h4_class_value !== (h4_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"))) {
    				attr_dev(h4, "class", h4_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(h4, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*type, upper*/ 3) {
    				toggle_class(h4, "title--upper", /*upper*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(42:24) ",
    		ctx
    	});

    	return block;
    }

    // (38:24) 
    function create_if_block_2(ctx) {
    	let h3;
    	let h3_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if (default_slot) default_slot.c();
    			attr_dev(h3, "class", h3_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"));
    			attr_dev(h3, "style", /*style*/ ctx[2]);
    			toggle_class(h3, "title--upper", /*upper*/ ctx[1]);
    			add_location(h3, file$4, 38, 2, 943);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);

    			if (default_slot) {
    				default_slot.m(h3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && h3_class_value !== (h3_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"))) {
    				attr_dev(h3, "class", h3_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(h3, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*type, upper*/ 3) {
    				toggle_class(h3, "title--upper", /*upper*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(38:24) ",
    		ctx
    	});

    	return block;
    }

    // (34:24) 
    function create_if_block_1(ctx) {
    	let h2;
    	let h2_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			if (default_slot) default_slot.c();
    			attr_dev(h2, "class", h2_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"));
    			attr_dev(h2, "style", /*style*/ ctx[2]);
    			toggle_class(h2, "title--upper", /*upper*/ ctx[1]);
    			add_location(h2, file$4, 34, 2, 824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);

    			if (default_slot) {
    				default_slot.m(h2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && h2_class_value !== (h2_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"))) {
    				attr_dev(h2, "class", h2_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(h2, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*type, upper*/ 3) {
    				toggle_class(h2, "title--upper", /*upper*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(34:24) ",
    		ctx
    	});

    	return block;
    }

    // (30:0) {#if type === 'h1'}
    function create_if_block$1(ctx) {
    	let h1;
    	let h1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", h1_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"));
    			attr_dev(h1, "style", /*style*/ ctx[2]);
    			toggle_class(h1, "title--upper", /*upper*/ ctx[1]);
    			add_location(h1, file$4, 30, 2, 705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);

    			if (default_slot) {
    				default_slot.m(h1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && h1_class_value !== (h1_class_value = "" + (null_to_empty(`title title--${/*type*/ ctx[0]}`) + " svelte-akzzg7"))) {
    				attr_dev(h1, "class", h1_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(h1, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*type, upper*/ 3) {
    				toggle_class(h1, "title--upper", /*upper*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:0) {#if type === 'h1'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block$1,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[0] === "h1") return 0;
    		if (/*type*/ ctx[0] === "h2") return 1;
    		if (/*type*/ ctx[0] === "h3") return 2;
    		if (/*type*/ ctx[0] === "h4") return 3;
    		if (/*type*/ ctx[0] === "h5") return 4;
    		if (/*type*/ ctx[0] === "h6") return 5;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Title", slots, ['default']);
    	let { type = "h1" } = $$props;
    	let { upper = false } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["type", "upper", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("upper" in $$props) $$invalidate(1, upper = $$props.upper);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, upper, style });

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("upper" in $$props) $$invalidate(1, upper = $$props.upper);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, upper, style, $$scope, slots];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { type: 0, upper: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get type() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get upper() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set upper(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_molecules/ContactCard.svelte generated by Svelte v3.29.0 */

    const file$5 = "src/_molecules/ContactCard.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Speak with one of our dedicated specialists today.";
    			t2 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Make an appointment with us at your earliest convenience.";
    			if (img0.src !== (img0_src_value = "images/speech-bubbles-chat-symbol.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "chat symbol");
    			attr_dev(img0, "class", "svelte-14ui15o");
    			add_location(img0, file$5, 24, 4, 577);
    			attr_dev(p0, "class", "svelte-14ui15o");
    			add_location(p0, file$5, 25, 4, 651);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-14ui15o");
    			add_location(a0, file$5, 23, 2, 560);
    			if (img1.src !== (img1_src_value = "images/appointment-book.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "appointment symbol");
    			attr_dev(img1, "class", "svelte-14ui15o");
    			add_location(img1, file$5, 28, 4, 735);
    			attr_dev(p1, "class", "svelte-14ui15o");
    			add_location(p1, file$5, 29, 4, 806);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-14ui15o");
    			add_location(a1, file$5, 27, 2, 718);
    			attr_dev(div, "class", "wrapper svelte-14ui15o");
    			add_location(div, file$5, 22, 0, 536);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(a0, img0);
    			append_dev(a0, t0);
    			append_dev(a0, p0);
    			append_dev(div, t2);
    			append_dev(div, a1);
    			append_dev(a1, img1);
    			append_dev(a1, t3);
    			append_dev(a1, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactCard", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactCard> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ContactCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactCard",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/_molecules/ContactDetails.svelte generated by Svelte v3.29.0 */
    const file$6 = "src/_molecules/ContactDetails.svelte";

    // (21:2) <Title type="h6">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*title*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:2) <Title type=\\\"h6\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let title_1;
    	let t0;
    	let a0;
    	let t1;
    	let a0_href_value;
    	let t2;
    	let a1;
    	let t3;
    	let a1_href_value;
    	let current;

    	title_1 = new Title({
    			props: {
    				type: "h6",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(title_1.$$.fragment);
    			t0 = space();
    			a0 = element("a");
    			t1 = text(/*tel*/ ctx[1]);
    			t2 = space();
    			a1 = element("a");
    			t3 = text(/*email*/ ctx[2]);
    			attr_dev(a0, "href", a0_href_value = `tel: ${/*tel*/ ctx[1]}`);
    			attr_dev(a0, "class", "svelte-1q8itnx");
    			add_location(a0, file$6, 21, 2, 510);
    			attr_dev(a1, "href", a1_href_value = `email: ${/*email*/ ctx[2]}`);
    			attr_dev(a1, "class", "svelte-1q8itnx");
    			add_location(a1, file$6, 22, 2, 546);
    			attr_dev(div, "class", "wrapper svelte-1q8itnx");
    			add_location(div, file$6, 19, 0, 451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(title_1, div, null);
    			append_dev(div, t0);
    			append_dev(div, a0);
    			append_dev(a0, t1);
    			append_dev(div, t2);
    			append_dev(div, a1);
    			append_dev(a1, t3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const title_1_changes = {};

    			if (dirty & /*$$scope, title*/ 9) {
    				title_1_changes.$$scope = { dirty, ctx };
    			}

    			title_1.$set(title_1_changes);
    			if (!current || dirty & /*tel*/ 2) set_data_dev(t1, /*tel*/ ctx[1]);

    			if (!current || dirty & /*tel*/ 2 && a0_href_value !== (a0_href_value = `tel: ${/*tel*/ ctx[1]}`)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*email*/ 4) set_data_dev(t3, /*email*/ ctx[2]);

    			if (!current || dirty & /*email*/ 4 && a1_href_value !== (a1_href_value = `email: ${/*email*/ ctx[2]}`)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactDetails", slots, []);
    	let { title } = $$props;
    	let { tel } = $$props;
    	let { email } = $$props;
    	const writable_props = ["title", "tel", "email"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactDetails> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("tel" in $$props) $$invalidate(1, tel = $$props.tel);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    	};

    	$$self.$capture_state = () => ({ Title, title, tel, email });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("tel" in $$props) $$invalidate(1, tel = $$props.tel);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, tel, email];
    }

    class ContactDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { title: 0, tel: 1, email: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactDetails",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<ContactDetails> was created without expected prop 'title'");
    		}

    		if (/*tel*/ ctx[1] === undefined && !("tel" in props)) {
    			console.warn("<ContactDetails> was created without expected prop 'tel'");
    		}

    		if (/*email*/ ctx[2] === undefined && !("email" in props)) {
    			console.warn("<ContactDetails> was created without expected prop 'email'");
    		}
    	}

    	get title() {
    		throw new Error("<ContactDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ContactDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tel() {
    		throw new Error("<ContactDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tel(value) {
    		throw new Error("<ContactDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error("<ContactDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<ContactDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const Search = writable({
      area: 'SW1',
      buy: true,
      min: 700000,
      max: 135000,
    });

    /* src/_atoms/Button.svelte generated by Svelte v3.29.0 */

    const file$7 = "src/_atoms/Button.svelte";

    // (42:0) {:else}
    function create_else_block(ctx) {
    	let button;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "button svelte-1h03m5p");
    			attr_dev(button, "style", /*style*/ ctx[4]);
    			toggle_class(button, "button--primary", /*primary*/ ctx[0]);
    			toggle_class(button, "button--secondary", /*secondary*/ ctx[1]);
    			toggle_class(button, "button--danger", /*danger*/ ctx[3]);
    			add_location(button, file$7, 42, 2, 924);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*style*/ 16) {
    				attr_dev(button, "style", /*style*/ ctx[4]);
    			}

    			if (dirty & /*primary*/ 1) {
    				toggle_class(button, "button--primary", /*primary*/ ctx[0]);
    			}

    			if (dirty & /*secondary*/ 2) {
    				toggle_class(button, "button--secondary", /*secondary*/ ctx[1]);
    			}

    			if (dirty & /*danger*/ 8) {
    				toggle_class(button, "button--danger", /*danger*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(42:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#if link}
    function create_if_block$2(ctx) {
    	let a;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "class", "link svelte-1h03m5p");
    			attr_dev(a, "href", /*link*/ ctx[2]);
    			attr_dev(a, "style", /*style*/ ctx[4]);
    			toggle_class(a, "button--primary", /*primary*/ ctx[0]);
    			toggle_class(a, "button--secondary", /*secondary*/ ctx[1]);
    			toggle_class(a, "button--danger", /*danger*/ ctx[3]);
    			add_location(a, file$7, 32, 2, 735);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*link*/ 4) {
    				attr_dev(a, "href", /*link*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 16) {
    				attr_dev(a, "style", /*style*/ ctx[4]);
    			}

    			if (dirty & /*primary*/ 1) {
    				toggle_class(a, "button--primary", /*primary*/ ctx[0]);
    			}

    			if (dirty & /*secondary*/ 2) {
    				toggle_class(a, "button--secondary", /*secondary*/ ctx[1]);
    			}

    			if (dirty & /*danger*/ 8) {
    				toggle_class(a, "button--danger", /*danger*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(32:0) {#if link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*link*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { primary = false } = $$props;
    	let { secondary = false } = $$props;
    	let { link = "" } = $$props;
    	let { danger = false } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["primary", "secondary", "link", "danger", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("primary" in $$props) $$invalidate(0, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(1, secondary = $$props.secondary);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    		if ("danger" in $$props) $$invalidate(3, danger = $$props.danger);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ primary, secondary, link, danger, style });

    	$$self.$inject_state = $$props => {
    		if ("primary" in $$props) $$invalidate(0, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(1, secondary = $$props.secondary);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    		if ("danger" in $$props) $$invalidate(3, danger = $$props.danger);
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [primary, secondary, link, danger, style, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			primary: 0,
    			secondary: 1,
    			link: 2,
    			danger: 3,
    			style: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get primary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/Input.svelte generated by Svelte v3.29.0 */
    const file$8 = "src/_atoms/Input.svelte";

    // (31:28) 
    function create_if_block_1$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "input svelte-129vuih");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "style", /*style*/ ctx[2]);
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			add_location(input, file$8, 31, 2, 723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[7]),
    					listen_dev(input, "input", /*handleInput*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*style*/ 4) {
    				attr_dev(input, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(input, "name", /*name*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 16 && to_number(input.value) !== /*value*/ ctx[4]) {
    				set_input_value(input, /*value*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(31:28) ",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if type === 'text'}
    function create_if_block$3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "input svelte-129vuih");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "style", /*style*/ ctx[2]);
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			add_location(input, file$8, 22, 2, 565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "input", /*handleInput*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*style*/ 4) {
    				attr_dev(input, "style", /*style*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(input, "name", /*name*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 16 && input.value !== /*value*/ ctx[4]) {
    				set_input_value(input, /*value*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(22:0) {#if type === 'text'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[0] === "text") return create_if_block$3;
    		if (/*type*/ ctx[0] === "number") return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	const dispatch = createEventDispatcher();
    	let { type = "text" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { style = "" } = $$props;
    	let { name = "" } = $$props;
    	let value;
    	const handleInput = () => dispatch("inputUpdate", [name, value]);
    	const writable_props = ["type", "placeholder", "style", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(4, value);
    	}

    	function input_input_handler_1() {
    		value = to_number(this.value);
    		$$invalidate(4, value);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		type,
    		placeholder,
    		style,
    		name,
    		value,
    		handleInput
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		type,
    		placeholder,
    		style,
    		name,
    		value,
    		handleInput,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			type: 0,
    			placeholder: 1,
    			style: 2,
    			name: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/Switch.svelte generated by Svelte v3.29.0 */
    const file$9 = "src/_atoms/Switch.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1;
    	let label;
    	let input;
    	let input_class_value;
    	let t2;
    	let p1;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(/*optionOne*/ ctx[1]);
    			t1 = space();
    			label = element("label");
    			input = element("input");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(/*optionTwo*/ ctx[2]);
    			attr_dev(p0, "class", "option svelte-1yaserg");
    			toggle_class(p0, "option--checked", !/*checked*/ ctx[3]);
    			add_location(p0, file$9, 72, 2, 1672);
    			attr_dev(input, "class", input_class_value = "" + (null_to_empty(`toggle toggle--${/*checked*/ ctx[3]}`) + " svelte-1yaserg"));
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$9, 74, 4, 1768);
    			attr_dev(label, "class", "switch svelte-1yaserg");
    			add_location(label, file$9, 73, 2, 1741);
    			attr_dev(p1, "class", "option svelte-1yaserg");
    			toggle_class(p1, "option--checked", /*checked*/ ctx[3]);
    			add_location(p1, file$9, 80, 2, 1904);
    			attr_dev(div, "class", "wrapper svelte-1yaserg");
    			attr_dev(div, "style", /*style*/ ctx[0]);
    			add_location(div, file$9, 71, 0, 1640);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = /*checked*/ ctx[3];
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[5]),
    					listen_dev(input, "change", /*switchInput*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*optionOne*/ 2) set_data_dev(t0, /*optionOne*/ ctx[1]);

    			if (dirty & /*checked*/ 8) {
    				toggle_class(p0, "option--checked", !/*checked*/ ctx[3]);
    			}

    			if (dirty & /*checked*/ 8 && input_class_value !== (input_class_value = "" + (null_to_empty(`toggle toggle--${/*checked*/ ctx[3]}`) + " svelte-1yaserg"))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*checked*/ 8) {
    				input.checked = /*checked*/ ctx[3];
    			}

    			if (dirty & /*optionTwo*/ 4) set_data_dev(t3, /*optionTwo*/ ctx[2]);

    			if (dirty & /*checked*/ 8) {
    				toggle_class(p1, "option--checked", /*checked*/ ctx[3]);
    			}

    			if (dirty & /*style*/ 1) {
    				attr_dev(div, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Switch", slots, []);
    	const dispatch = createEventDispatcher();
    	let { style } = $$props;
    	let checked = false;
    	let { optionOne = "false" } = $$props;
    	let { optionTwo = "true" } = $$props;
    	const switchInput = () => dispatch("switchInput", checked);
    	const writable_props = ["style", "optionOne", "optionTwo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(3, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("optionOne" in $$props) $$invalidate(1, optionOne = $$props.optionOne);
    		if ("optionTwo" in $$props) $$invalidate(2, optionTwo = $$props.optionTwo);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		style,
    		checked,
    		optionOne,
    		optionTwo,
    		switchInput
    	});

    	$$self.$inject_state = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("checked" in $$props) $$invalidate(3, checked = $$props.checked);
    		if ("optionOne" in $$props) $$invalidate(1, optionOne = $$props.optionOne);
    		if ("optionTwo" in $$props) $$invalidate(2, optionTwo = $$props.optionTwo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style, optionOne, optionTwo, checked, switchInput, input_change_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { style: 0, optionOne: 1, optionTwo: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*style*/ ctx[0] === undefined && !("style" in props)) {
    			console.warn("<Switch> was created without expected prop 'style'");
    		}
    	}

    	get style() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionOne() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionOne(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionTwo() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionTwo(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_molecules/SearchPanel.svelte generated by Svelte v3.29.0 */
    const file$a = "src/_molecules/SearchPanel.svelte";

    // (40:4) <Card>
    function create_default_slot_4(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				placeholder: "Knighsbridge, SW7, Gloucester Road",
    				name: "area"
    			},
    			$$inline: true
    		});

    	input.$on("inputUpdate", /*valueInput*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(40:4) <Card>",
    		ctx
    	});

    	return block;
    }

    // (49:4) <Card>
    function create_default_slot_3(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				type: "number",
    				placeholder: /*buy*/ ctx[2] ? "650,000" : "3,500 pcm",
    				name: "min"
    			},
    			$$inline: true
    		});

    	input.$on("inputUpdate", /*valueInput*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty & /*buy*/ 4) input_changes.placeholder = /*buy*/ ctx[2] ? "650,000" : "3,500 pcm";
    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(49:4) <Card>",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Card>
    function create_default_slot_2(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				type: "number",
    				placeholder: /*buy*/ ctx[2] ? "13,000,000" : "10,000 pcm",
    				name: "max"
    			},
    			$$inline: true
    		});

    	input.$on("inputUpdate", /*valueInput*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty & /*buy*/ 4) input_changes.placeholder = /*buy*/ ctx[2] ? "13,000,000" : "10,000 pcm";
    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(59:4) <Card>",
    		ctx
    	});

    	return block;
    }

    // (68:4) <Button primary link="/properties">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Search");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(68:4) <Button primary link=\\\"/properties\\\">",
    		ctx
    	});

    	return block;
    }

    // (67:2) <Card style="grid-column: 1 / 3;">
    function create_default_slot$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				primary: true,
    				link: "/properties",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(67:2) <Card style=\\\"grid-column: 1 / 3;\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div3;
    	let switch_1;
    	let t0;
    	let div0;
    	let p0;
    	let t2;
    	let card0;
    	let t3;
    	let div1;
    	let p1;
    	let t5;
    	let card1;
    	let t6;
    	let div2;
    	let p2;
    	let t8;
    	let card2;
    	let t9;
    	let card3;
    	let current;

    	switch_1 = new Switch({
    			props: {
    				optionOne: /*optionOne*/ ctx[0],
    				optionTwo: /*optionTwo*/ ctx[1],
    				style: "grid-column: 1 / 3;"
    			},
    			$$inline: true
    		});

    	switch_1.$on("switchInput", /*switchInput*/ ctx[3]);

    	card0 = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card1 = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card2 = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card3 = new Card({
    			props: {
    				style: "grid-column: 1 / 3;",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			create_component(switch_1.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Area, street or postcode";
    			t2 = space();
    			create_component(card0.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Min (£)";
    			t5 = space();
    			create_component(card1.$$.fragment);
    			t6 = space();
    			div2 = element("div");
    			p2 = element("p");
    			p2.textContent = "Max (£)";
    			t8 = space();
    			create_component(card2.$$.fragment);
    			t9 = space();
    			create_component(card3.$$.fragment);
    			attr_dev(p0, "class", "svelte-1gi6ll");
    			add_location(p0, file$a, 38, 4, 1062);
    			set_style(div0, "grid-column", "1 / 3");
    			set_style(div0, "width", "100%");
    			add_location(div0, file$a, 37, 2, 1011);
    			attr_dev(p1, "class", "svelte-1gi6ll");
    			add_location(p1, file$a, 47, 4, 1295);
    			set_style(div1, "grid-column", "1 / 2");
    			add_location(div1, file$a, 46, 2, 1257);
    			attr_dev(p2, "class", "svelte-1gi6ll");
    			add_location(p2, file$a, 57, 4, 1527);
    			set_style(div2, "grid-column", "2 / 3");
    			add_location(div2, file$a, 56, 2, 1489);
    			attr_dev(div3, "class", "panel svelte-1gi6ll");
    			add_location(div3, file$a, 31, 0, 879);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			mount_component(switch_1, div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);
    			mount_component(card0, div0, null);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t5);
    			mount_component(card1, div1, null);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, p2);
    			append_dev(div2, t8);
    			mount_component(card2, div2, null);
    			append_dev(div3, t9);
    			mount_component(card3, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_1_changes = {};
    			if (dirty & /*optionOne*/ 1) switch_1_changes.optionOne = /*optionOne*/ ctx[0];
    			if (dirty & /*optionTwo*/ 2) switch_1_changes.optionTwo = /*optionTwo*/ ctx[1];
    			switch_1.$set(switch_1_changes);
    			const card0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				card0_changes.$$scope = { dirty, ctx };
    			}

    			card0.$set(card0_changes);
    			const card1_changes = {};

    			if (dirty & /*$$scope, buy*/ 68) {
    				card1_changes.$$scope = { dirty, ctx };
    			}

    			card1.$set(card1_changes);
    			const card2_changes = {};

    			if (dirty & /*$$scope, buy*/ 68) {
    				card2_changes.$$scope = { dirty, ctx };
    			}

    			card2.$set(card2_changes);
    			const card3_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				card3_changes.$$scope = { dirty, ctx };
    			}

    			card3.$set(card3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			transition_in(card0.$$.fragment, local);
    			transition_in(card1.$$.fragment, local);
    			transition_in(card2.$$.fragment, local);
    			transition_in(card3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			transition_out(card2.$$.fragment, local);
    			transition_out(card3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(switch_1);
    			destroy_component(card0);
    			destroy_component(card1);
    			destroy_component(card2);
    			destroy_component(card3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $Search;
    	validate_store(Search, "Search");
    	component_subscribe($$self, Search, $$value => $$invalidate(5, $Search = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SearchPanel", slots, []);
    	let { optionOne } = $$props;
    	let { optionTwo } = $$props;

    	const switchInput = e => e.detail
    	? $$invalidate(2, buy = false)
    	: $$invalidate(2, buy = true);

    	const valueInput = e => set_store_value(Search, $Search[e.detail[0]] = e.detail[1], $Search);
    	const writable_props = ["optionOne", "optionTwo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("optionOne" in $$props) $$invalidate(0, optionOne = $$props.optionOne);
    		if ("optionTwo" in $$props) $$invalidate(1, optionTwo = $$props.optionTwo);
    	};

    	$$self.$capture_state = () => ({
    		Search,
    		Button,
    		Card,
    		Input,
    		Switch,
    		optionOne,
    		optionTwo,
    		switchInput,
    		valueInput,
    		buy,
    		$Search
    	});

    	$$self.$inject_state = $$props => {
    		if ("optionOne" in $$props) $$invalidate(0, optionOne = $$props.optionOne);
    		if ("optionTwo" in $$props) $$invalidate(1, optionTwo = $$props.optionTwo);
    		if ("buy" in $$props) $$invalidate(2, buy = $$props.buy);
    	};

    	let buy;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*buy*/ 4) {
    			 set_store_value(Search, $Search.buy = buy, $Search);
    		}
    	};

    	 $$invalidate(2, buy = true);
    	return [optionOne, optionTwo, buy, switchInput, valueInput];
    }

    class SearchPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { optionOne: 0, optionTwo: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchPanel",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*optionOne*/ ctx[0] === undefined && !("optionOne" in props)) {
    			console.warn("<SearchPanel> was created without expected prop 'optionOne'");
    		}

    		if (/*optionTwo*/ ctx[1] === undefined && !("optionTwo" in props)) {
    			console.warn("<SearchPanel> was created without expected prop 'optionTwo'");
    		}
    	}

    	get optionOne() {
    		throw new Error("<SearchPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionOne(value) {
    		throw new Error("<SearchPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionTwo() {
    		throw new Error("<SearchPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionTwo(value) {
    		throw new Error("<SearchPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/MonthPicker.svelte generated by Svelte v3.29.0 */
    const file$b = "src/_atoms/MonthPicker.svelte";

    function create_fragment$b(ctx) {
    	let div1;
    	let button0;
    	let t1;
    	let div0;
    	let p0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "◂";
    			t1 = space();
    			div0 = element("div");
    			p0 = element("p");
    			t2 = text(/*fullMonth*/ ctx[0]);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*fullYear*/ ctx[1]);
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "▸";
    			attr_dev(button0, "class", "prev svelte-q6hz93");
    			add_location(button0, file$b, 55, 2, 1141);
    			attr_dev(p0, "class", "month svelte-q6hz93");
    			add_location(p0, file$b, 57, 4, 1241);
    			attr_dev(p1, "class", "year svelte-q6hz93");
    			add_location(p1, file$b, 58, 4, 1278);
    			attr_dev(div0, "class", "display");
    			add_location(div0, file$b, 56, 2, 1215);
    			attr_dev(button1, "class", "next svelte-q6hz93");
    			add_location(button1, file$b, 60, 2, 1320);
    			attr_dev(div1, "class", "wrapper svelte-q6hz93");
    			add_location(div1, file$b, 54, 0, 1117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(p1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fullMonth*/ 1) set_data_dev(t2, /*fullMonth*/ ctx[0]);
    			if (dirty & /*fullYear*/ 2) set_data_dev(t4, /*fullYear*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MonthPicker", slots, []);
    	const dispatch = createEventDispatcher();

    	const months = [
    		"January",
    		"February",
    		"March",
    		"April",
    		"May",
    		"June",
    		"July",
    		"August",
    		"September",
    		"October",
    		"November",
    		"December"
    	];

    	let { month = 0 } = $$props;
    	let { year = 2020 } = $$props;
    	const iterateMonth = iterator => dispatch("iterateMonth", { iterator, months });
    	const writable_props = ["month", "year"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MonthPicker> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => iterateMonth(-1);
    	const click_handler_1 = () => iterateMonth(1);

    	$$self.$$set = $$props => {
    		if ("month" in $$props) $$invalidate(3, month = $$props.month);
    		if ("year" in $$props) $$invalidate(4, year = $$props.year);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		months,
    		month,
    		year,
    		iterateMonth,
    		fullMonth,
    		fullYear
    	});

    	$$self.$inject_state = $$props => {
    		if ("month" in $$props) $$invalidate(3, month = $$props.month);
    		if ("year" in $$props) $$invalidate(4, year = $$props.year);
    		if ("fullMonth" in $$props) $$invalidate(0, fullMonth = $$props.fullMonth);
    		if ("fullYear" in $$props) $$invalidate(1, fullYear = $$props.fullYear);
    	};

    	let fullMonth;
    	let fullYear;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*month*/ 8) {
    			 $$invalidate(0, fullMonth = months[month]);
    		}

    		if ($$self.$$.dirty & /*year*/ 16) {
    			 $$invalidate(1, fullYear = year);
    		}
    	};

    	return [fullMonth, fullYear, iterateMonth, month, year, click_handler, click_handler_1];
    }

    class MonthPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { month: 3, year: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MonthPicker",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get month() {
    		throw new Error("<MonthPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<MonthPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<MonthPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<MonthPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/DateToggle.svelte generated by Svelte v3.29.0 */
    const file$c = "src/_atoms/DateToggle.svelte";

    function create_fragment$c(ctx) {
    	let label;
    	let input;
    	let t0;
    	let p;
    	let t1;
    	let label_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*number*/ ctx[1]);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", /*name*/ ctx[0]);
    			input.value = /*value*/ ctx[4];
    			attr_dev(input, "class", "svelte-1kphtq6");
    			add_location(input, file$c, 50, 2, 1262);
    			attr_dev(p, "class", "number svelte-1kphtq6");
    			add_location(p, file$c, 51, 2, 1331);

    			attr_dev(label, "class", label_class_value = "" + (null_to_empty(`wrapper wrapper--${/*selectedDate*/ ctx[3] === /*value*/ ctx[4]
			? true
			: false}`) + " svelte-1kphtq6"));

    			toggle_class(label, "wrapper--current", /*current*/ ctx[2]);
    			add_location(label, file$c, 47, 0, 1147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, p);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*updateSelected*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) {
    				attr_dev(input, "name", /*name*/ ctx[0]);
    			}

    			if (dirty & /*value*/ 16) {
    				prop_dev(input, "value", /*value*/ ctx[4]);
    			}

    			if (dirty & /*number*/ 2) set_data_dev(t1, /*number*/ ctx[1]);

    			if (dirty & /*selectedDate, value*/ 24 && label_class_value !== (label_class_value = "" + (null_to_empty(`wrapper wrapper--${/*selectedDate*/ ctx[3] === /*value*/ ctx[4]
			? true
			: false}`) + " svelte-1kphtq6"))) {
    				attr_dev(label, "class", label_class_value);
    			}

    			if (dirty & /*selectedDate, value, current*/ 28) {
    				toggle_class(label, "wrapper--current", /*current*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DateToggle", slots, []);
    	const dispatch = createEventDispatcher();
    	let { name } = $$props;
    	let { number } = $$props;
    	let { current = false } = $$props;
    	let { selectedDate } = $$props;
    	let { value } = $$props;
    	const updateSelected = () => dispatch("updateSelected", value);
    	const writable_props = ["name", "number", "current", "selectedDate", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DateToggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("number" in $$props) $$invalidate(1, number = $$props.number);
    		if ("current" in $$props) $$invalidate(2, current = $$props.current);
    		if ("selectedDate" in $$props) $$invalidate(3, selectedDate = $$props.selectedDate);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		name,
    		number,
    		current,
    		selectedDate,
    		value,
    		updateSelected
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("number" in $$props) $$invalidate(1, number = $$props.number);
    		if ("current" in $$props) $$invalidate(2, current = $$props.current);
    		if ("selectedDate" in $$props) $$invalidate(3, selectedDate = $$props.selectedDate);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, number, current, selectedDate, value, updateSelected];
    }

    class DateToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			name: 0,
    			number: 1,
    			current: 2,
    			selectedDate: 3,
    			value: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateToggle",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<DateToggle> was created without expected prop 'name'");
    		}

    		if (/*number*/ ctx[1] === undefined && !("number" in props)) {
    			console.warn("<DateToggle> was created without expected prop 'number'");
    		}

    		if (/*selectedDate*/ ctx[3] === undefined && !("selectedDate" in props)) {
    			console.warn("<DateToggle> was created without expected prop 'selectedDate'");
    		}

    		if (/*value*/ ctx[4] === undefined && !("value" in props)) {
    			console.warn("<DateToggle> was created without expected prop 'value'");
    		}
    	}

    	get name() {
    		throw new Error("<DateToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<DateToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get number() {
    		throw new Error("<DateToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<DateToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<DateToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<DateToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedDate() {
    		throw new Error("<DateToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedDate(value) {
    		throw new Error("<DateToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<DateToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<DateToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_molecules/Calendar.svelte generated by Svelte v3.29.0 */
    const file$d = "src/_molecules/Calendar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (78:4) {:else}
    function create_else_block$1(ctx) {
    	let datetoggle;
    	let current;

    	datetoggle = new DateToggle({
    			props: {
    				name: "date",
    				number: /*date*/ ctx[8],
    				value: /*date*/ ctx[8],
    				selectedDate: /*selectedDate*/ ctx[3]
    			},
    			$$inline: true
    		});

    	datetoggle.$on("updateSelected", /*updateSelected*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(datetoggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(datetoggle, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const datetoggle_changes = {};
    			if (dirty & /*month*/ 4) datetoggle_changes.number = /*date*/ ctx[8];
    			if (dirty & /*month*/ 4) datetoggle_changes.value = /*date*/ ctx[8];
    			if (dirty & /*selectedDate*/ 8) datetoggle_changes.selectedDate = /*selectedDate*/ ctx[3];
    			datetoggle.$set(datetoggle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datetoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datetoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(datetoggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(78:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (70:4) {#if parseInt(currentDate - 1) === i && new Date().getMonth() === viewedDate[0]}
    function create_if_block$4(ctx) {
    	let datetoggle;
    	let current;

    	datetoggle = new DateToggle({
    			props: {
    				name: "date",
    				number: /*date*/ ctx[8],
    				value: /*date*/ ctx[8],
    				selectedDate: /*selectedDate*/ ctx[3],
    				current: true
    			},
    			$$inline: true
    		});

    	datetoggle.$on("updateSelected", /*updateSelected*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(datetoggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(datetoggle, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const datetoggle_changes = {};
    			if (dirty & /*month*/ 4) datetoggle_changes.number = /*date*/ ctx[8];
    			if (dirty & /*month*/ 4) datetoggle_changes.value = /*date*/ ctx[8];
    			if (dirty & /*selectedDate*/ 8) datetoggle_changes.selectedDate = /*selectedDate*/ ctx[3];
    			datetoggle.$set(datetoggle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datetoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datetoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(datetoggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(70:4) {#if parseInt(currentDate - 1) === i && new Date().getMonth() === viewedDate[0]}",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#each month as date, i}
    function create_each_block(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*currentDate, viewedDate*/ 3) show_if = !!(parseInt(/*currentDate*/ ctx[0] - 1) === /*i*/ ctx[10] && new Date().getMonth() === /*viewedDate*/ ctx[1][0]);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(69:2) {#each month as date, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let form;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;
    	let t5;
    	let span3;
    	let t7;
    	let span4;
    	let t9;
    	let span5;
    	let t11;
    	let span6;
    	let t13;
    	let div;
    	let div_style_value;
    	let t14;
    	let current;
    	let each_value = /*month*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			form = element("form");
    			span0 = element("span");
    			span0.textContent = "S";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "M";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "T";
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "W";
    			t7 = space();
    			span4 = element("span");
    			span4.textContent = "T";
    			t9 = space();
    			span5 = element("span");
    			span5.textContent = "F";
    			t11 = space();
    			span6 = element("span");
    			span6.textContent = "S";
    			t13 = space();
    			div = element("div");
    			t14 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span0, "class", "day svelte-zpc7bq");
    			add_location(span0, file$d, 53, 2, 1214);
    			attr_dev(span1, "class", "day svelte-zpc7bq");
    			add_location(span1, file$d, 54, 2, 1243);
    			attr_dev(span2, "class", "day svelte-zpc7bq");
    			add_location(span2, file$d, 55, 2, 1272);
    			attr_dev(span3, "class", "day svelte-zpc7bq");
    			add_location(span3, file$d, 56, 2, 1301);
    			attr_dev(span4, "class", "day svelte-zpc7bq");
    			add_location(span4, file$d, 57, 2, 1330);
    			attr_dev(span5, "class", "day svelte-zpc7bq");
    			add_location(span5, file$d, 58, 2, 1359);
    			attr_dev(span6, "class", "day svelte-zpc7bq");
    			add_location(span6, file$d, 59, 2, 1388);
    			attr_dev(div, "class", "placeholder");

    			attr_dev(div, "style", div_style_value = `
        display: ${/*gridStart*/ ctx[4] === 0 ? "none" : "block"};
        grid-column: 1 / ${/*gridStart*/ ctx[4] + 1};
        `);

    			add_location(div, file$d, 61, 2, 1418);
    			attr_dev(form, "class", "calendar svelte-zpc7bq");
    			add_location(form, file$d, 52, 0, 1188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, span0);
    			append_dev(form, t1);
    			append_dev(form, span1);
    			append_dev(form, t3);
    			append_dev(form, span2);
    			append_dev(form, t5);
    			append_dev(form, span3);
    			append_dev(form, t7);
    			append_dev(form, span4);
    			append_dev(form, t9);
    			append_dev(form, span5);
    			append_dev(form, t11);
    			append_dev(form, span6);
    			append_dev(form, t13);
    			append_dev(form, div);
    			append_dev(form, t14);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*gridStart*/ 16 && div_style_value !== (div_style_value = `
        display: ${/*gridStart*/ ctx[4] === 0 ? "none" : "block"};
        grid-column: 1 / ${/*gridStart*/ ctx[4] + 1};
        `)) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty & /*month, selectedDate, updateSelected, parseInt, currentDate, Date, viewedDate*/ 47) {
    				each_value = /*month*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(form, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Calendar", slots, []);
    	let { currentDate } = $$props;
    	let { viewedDate } = $$props;
    	let month = [];

    	const daysInMonth = (y, m) => {
    		$$invalidate(2, month.length = 0, month);
    		let m2 = m + 1 === 12 ? 0 : m + 1;
    		let days = new Date(y, m2, 0).getDate();

    		for (let i = 1; i <= days; i++) {
    			month.push(i);
    		}
    	};

    	let selectedDate = currentDate + 1;

    	const updateSelected = e => {
    		if (new Date().getMonth() !== viewedDate[0]) {
    			$$invalidate(3, selectedDate = e.detail);
    		} else {
    			e.detail > currentDate && $$invalidate(3, selectedDate = e.detail);
    		}
    	};

    	const monthStart = arr => {
    		let month = arr[0];
    		let year = arr[1];
    		let date = new Date(year, month, 1);
    		let firstDay = date.getDay();
    		return firstDay;
    	};

    	const writable_props = ["currentDate", "viewedDate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Calendar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("currentDate" in $$props) $$invalidate(0, currentDate = $$props.currentDate);
    		if ("viewedDate" in $$props) $$invalidate(1, viewedDate = $$props.viewedDate);
    	};

    	$$self.$capture_state = () => ({
    		DateToggle,
    		currentDate,
    		viewedDate,
    		month,
    		daysInMonth,
    		selectedDate,
    		updateSelected,
    		monthStart,
    		gridStart
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentDate" in $$props) $$invalidate(0, currentDate = $$props.currentDate);
    		if ("viewedDate" in $$props) $$invalidate(1, viewedDate = $$props.viewedDate);
    		if ("month" in $$props) $$invalidate(2, month = $$props.month);
    		if ("selectedDate" in $$props) $$invalidate(3, selectedDate = $$props.selectedDate);
    		if ("gridStart" in $$props) $$invalidate(4, gridStart = $$props.gridStart);
    	};

    	let gridStart;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*viewedDate*/ 2) {
    			 $$invalidate(4, gridStart = monthStart(viewedDate));
    		}

    		if ($$self.$$.dirty & /*viewedDate*/ 2) {
    			 daysInMonth(viewedDate[1], viewedDate[0]);
    		}
    	};

    	return [currentDate, viewedDate, month, selectedDate, gridStart, updateSelected];
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { currentDate: 0, viewedDate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentDate*/ ctx[0] === undefined && !("currentDate" in props)) {
    			console.warn("<Calendar> was created without expected prop 'currentDate'");
    		}

    		if (/*viewedDate*/ ctx[1] === undefined && !("viewedDate" in props)) {
    			console.warn("<Calendar> was created without expected prop 'viewedDate'");
    		}
    	}

    	get currentDate() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentDate(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewedDate() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewedDate(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_organisms/DatePicker.svelte generated by Svelte v3.29.0 */
    const file$e = "src/_organisms/DatePicker.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let monthpicker;
    	let t;
    	let calendar;
    	let current;

    	monthpicker = new MonthPicker({
    			props: {
    				year: /*currentYear*/ ctx[0],
    				month: /*currentMonth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	monthpicker.$on("iterateMonth", /*iterateMonth*/ ctx[4]);

    	calendar = new Calendar({
    			props: {
    				currentDate: /*currentDate*/ ctx[3],
    				viewedDate: /*viewedDate*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(monthpicker.$$.fragment);
    			t = space();
    			create_component(calendar.$$.fragment);
    			attr_dev(div, "class", "calendar");
    			add_location(div, file$e, 31, 0, 821);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(monthpicker, div, null);
    			append_dev(div, t);
    			mount_component(calendar, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const monthpicker_changes = {};
    			if (dirty & /*currentYear*/ 1) monthpicker_changes.year = /*currentYear*/ ctx[0];
    			if (dirty & /*currentMonth*/ 2) monthpicker_changes.month = /*currentMonth*/ ctx[1];
    			monthpicker.$set(monthpicker_changes);
    			const calendar_changes = {};
    			if (dirty & /*viewedDate*/ 4) calendar_changes.viewedDate = /*viewedDate*/ ctx[2];
    			calendar.$set(calendar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(monthpicker.$$.fragment, local);
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(monthpicker.$$.fragment, local);
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(monthpicker);
    			destroy_component(calendar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DatePicker", slots, []);
    	let date = new Date();
    	let currentYear = date.getFullYear();
    	let currentMonth = date.getMonth();
    	let currentDate = date.getDate();

    	const iterateMonth = e => {
    		if (e.detail.iterator > 0) {
    			if (currentMonth + 1 === e.detail.months.length) {
    				$$invalidate(1, currentMonth = 0);
    				$$invalidate(0, currentYear += 1);
    			} else {
    				$$invalidate(1, currentMonth = currentMonth + e.detail.iterator);
    			}
    		} else {
    			if (currentMonth === 0) {
    				$$invalidate(1, currentMonth = e.detail.months.length - 1);
    				$$invalidate(0, currentYear -= 1);
    			} else {
    				$$invalidate(1, currentMonth = currentMonth + e.detail.iterator);
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DatePicker> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MonthPicker,
    		Calendar,
    		date,
    		currentYear,
    		currentMonth,
    		currentDate,
    		iterateMonth,
    		viewedDate
    	});

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) date = $$props.date;
    		if ("currentYear" in $$props) $$invalidate(0, currentYear = $$props.currentYear);
    		if ("currentMonth" in $$props) $$invalidate(1, currentMonth = $$props.currentMonth);
    		if ("currentDate" in $$props) $$invalidate(3, currentDate = $$props.currentDate);
    		if ("viewedDate" in $$props) $$invalidate(2, viewedDate = $$props.viewedDate);
    	};

    	let viewedDate;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentMonth, currentYear*/ 3) {
    			 $$invalidate(2, viewedDate = [currentMonth, currentYear]);
    		}
    	};

    	return [currentYear, currentMonth, viewedDate, currentDate, iterateMonth];
    }

    class DatePicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DatePicker",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/_views/Home.svelte generated by Svelte v3.29.0 */
    const file$f = "src/_views/Home.svelte";

    // (15:0) <ParallaxImage src="/images/roberto-nickson-rEJxpBskj3Q-unsplash.jpg">
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Welcome to the luxury of home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(15:0) <ParallaxImage src=\\\"/images/roberto-nickson-rEJxpBskj3Q-unsplash.jpg\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:4) <Title       type="h5"       style="position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%); width: calc(100% - 2rem); padding: 1rem;">
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("\"Eu irure tempor magna cupidatat deserunt duis ullamco cillum nisi laborum\n      proident cillum laboris.\"");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(22:4) <Title       type=\\\"h5\\\"       style=\\\"position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%); width: calc(100% - 2rem); padding: 1rem;\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:2) <Card     style="position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;">
    function create_default_slot_11(ctx) {
    	let title;
    	let current;

    	title = new Title({
    			props: {
    				type: "h5",
    				style: "position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%); width: calc(100% - 2rem); padding: 1rem;",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const title_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				title_changes.$$scope = { dirty, ctx };
    			}

    			title.$set(title_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(20:2) <Card     style=\\\"position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;\\\">",
    		ctx
    	});

    	return block;
    }

    // (19:0) <Block height="20rem">
    function create_default_slot_10(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				style: "position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(19:0) <Block height=\\\"20rem\\\">",
    		ctx
    	});

    	return block;
    }

    // (31:2) <Title type="h4">
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("START YOUR JOURNEY");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(31:2) <Title type=\\\"h4\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:0) <Block primary style="padding: 3rem 1rem; z-index: 5;">
    function create_default_slot_8(ctx) {
    	let title;
    	let t;
    	let searchpanel;
    	let current;

    	title = new Title({
    			props: {
    				type: "h4",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	searchpanel = new SearchPanel({
    			props: { optionOne: "Buy", optionTwo: "Rent" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    			t = space();
    			create_component(searchpanel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(searchpanel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const title_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				title_changes.$$scope = { dirty, ctx };
    			}

    			title.$set(title_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(searchpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(searchpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(searchpanel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(30:0) <Block primary style=\\\"padding: 3rem 1rem; z-index: 5;\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:2) <Card     style="position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); padding: 1rem; text-align: center; z-index: 10;">
    function create_default_slot_7(ctx) {
    	let contactcard;
    	let current;
    	contactcard = new ContactCard({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contactcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contactcard, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contactcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(36:2) <Card     style=\\\"position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); padding: 1rem; text-align: center; z-index: 10;\\\">",
    		ctx
    	});

    	return block;
    }

    // (35:0) <Block height="20rem">
    function create_default_slot_6(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				style: "position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); padding: 1rem; text-align: center; z-index: 10;",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(35:0) <Block height=\\\"20rem\\\">",
    		ctx
    	});

    	return block;
    }

    // (42:2) <Card     low     style="margin: 0 1rem; width: calc(100% - 2rem); border-bottom-right-radius: .75rem; border-bottom-left-radius: .75rem;">
    function create_default_slot_5(ctx) {
    	let datepicker;
    	let current;
    	datepicker = new DatePicker({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(datepicker.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(datepicker, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datepicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datepicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(datepicker, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(42:2) <Card     low     style=\\\"margin: 0 1rem; width: calc(100% - 2rem); border-bottom-right-radius: .75rem; border-bottom-left-radius: .75rem;\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:0) <Block height="60rem">
    function create_default_slot_4$1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				low: true,
    				style: "margin: 0 1rem; width: calc(100% - 2rem); border-bottom-right-radius: .75rem; border-bottom-left-radius: .75rem;",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(41:0) <Block height=\\\"60rem\\\">",
    		ctx
    	});

    	return block;
    }

    // (50:2) <Card     style="position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;">
    function create_default_slot_3$1(ctx) {
    	let mapframe;
    	let current;
    	mapframe = new MapFrame({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mapframe.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mapframe, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapframe.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapframe.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mapframe, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(50:2) <Card     style=\\\"position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:0) <Block height="23rem" primary>
    function create_default_slot_2$1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				style: "position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(49:0) <Block height=\\\"23rem\\\" primary>",
    		ctx
    	});

    	return block;
    }

    // (56:2) <Title type="h4">
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("VISIT OR CONTACT US");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(56:2) <Title type=\\\"h4\\\">",
    		ctx
    	});

    	return block;
    }

    // (55:0) <Block primary style="margin-top: -1px; padding-bottom: 4rem;">
    function create_default_slot$2(ctx) {
    	let title;
    	let t0;
    	let div;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let p3;
    	let t8;
    	let contactdetails0;
    	let t9;
    	let contactdetails1;
    	let current;

    	title = new Title({
    			props: {
    				type: "h4",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contactdetails0 = new ContactDetails({
    			props: {
    				title: "Sales",
    				tel: "0208 521 7938",
    				email: "sales@opulentproperties.com"
    			},
    			$$inline: true
    		});

    	contactdetails1 = new ContactDetails({
    			props: {
    				title: "Lettings",
    				tel: "0208 521 7940",
    				email: "lettings@opulentproperties.com"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    			t0 = space();
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "237 - 238 Gilbert St";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Mayfair";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "London";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "W1K 4AH";
    			t8 = space();
    			create_component(contactdetails0.$$.fragment);
    			t9 = space();
    			create_component(contactdetails1.$$.fragment);
    			add_location(p0, file$f, 57, 4, 2259);
    			add_location(p1, file$f, 58, 4, 2291);
    			add_location(p2, file$f, 59, 4, 2310);
    			add_location(p3, file$f, 60, 4, 2328);
    			set_style(div, "margin-bottom", "3rem");
    			set_style(div, "text-align", "center");
    			add_location(div, file$f, 56, 2, 2200);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(div, t4);
    			append_dev(div, p2);
    			append_dev(div, t6);
    			append_dev(div, p3);
    			insert_dev(target, t8, anchor);
    			mount_component(contactdetails0, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(contactdetails1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const title_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				title_changes.$$scope = { dirty, ctx };
    			}

    			title.$set(title_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(contactdetails0.$$.fragment, local);
    			transition_in(contactdetails1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(contactdetails0.$$.fragment, local);
    			transition_out(contactdetails1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t8);
    			destroy_component(contactdetails0, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(contactdetails1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(55:0) <Block primary style=\\\"margin-top: -1px; padding-bottom: 4rem;\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let parallaximage0;
    	let t0;
    	let block0;
    	let t1;
    	let block1;
    	let t2;
    	let block2;
    	let t3;
    	let parallaximage1;
    	let t4;
    	let block3;
    	let t5;
    	let block4;
    	let t6;
    	let parallaximage2;
    	let t7;
    	let block5;
    	let t8;
    	let block6;
    	let current;

    	parallaximage0 = new ParallaxImage({
    			props: {
    				src: "/images/roberto-nickson-rEJxpBskj3Q-unsplash.jpg",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	block0 = new Block({
    			props: {
    				height: "16rem",
    				style: "top: -1rem;",
    				primary: true
    			},
    			$$inline: true
    		});

    	block1 = new Block({
    			props: {
    				height: "20rem",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	block2 = new Block({
    			props: {
    				primary: true,
    				style: "padding: 3rem 1rem; z-index: 5;",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	parallaximage1 = new ParallaxImage({
    			props: {
    				src: "/images/stephen-packwood-05NwbYV2t_g-unsplash.jpg"
    			},
    			$$inline: true
    		});

    	block3 = new Block({
    			props: {
    				height: "20rem",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	block4 = new Block({
    			props: {
    				height: "60rem",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	parallaximage2 = new ParallaxImage({
    			props: {
    				src: "/images/nastuh-abootalebi-yWwob8kwOCk-unsplash.jpg"
    			},
    			$$inline: true
    		});

    	block5 = new Block({
    			props: {
    				height: "23rem",
    				primary: true,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	block6 = new Block({
    			props: {
    				primary: true,
    				style: "margin-top: -1px; padding-bottom: 4rem;",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(parallaximage0.$$.fragment);
    			t0 = space();
    			create_component(block0.$$.fragment);
    			t1 = space();
    			create_component(block1.$$.fragment);
    			t2 = space();
    			create_component(block2.$$.fragment);
    			t3 = space();
    			create_component(parallaximage1.$$.fragment);
    			t4 = space();
    			create_component(block3.$$.fragment);
    			t5 = space();
    			create_component(block4.$$.fragment);
    			t6 = space();
    			create_component(parallaximage2.$$.fragment);
    			t7 = space();
    			create_component(block5.$$.fragment);
    			t8 = space();
    			create_component(block6.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(parallaximage0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(block0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(block1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(block2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(parallaximage1, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(block3, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(block4, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(parallaximage2, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(block5, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(block6, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const parallaximage0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				parallaximage0_changes.$$scope = { dirty, ctx };
    			}

    			parallaximage0.$set(parallaximage0_changes);
    			const block1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				block1_changes.$$scope = { dirty, ctx };
    			}

    			block1.$set(block1_changes);
    			const block2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				block2_changes.$$scope = { dirty, ctx };
    			}

    			block2.$set(block2_changes);
    			const block3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				block3_changes.$$scope = { dirty, ctx };
    			}

    			block3.$set(block3_changes);
    			const block4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				block4_changes.$$scope = { dirty, ctx };
    			}

    			block4.$set(block4_changes);
    			const block5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				block5_changes.$$scope = { dirty, ctx };
    			}

    			block5.$set(block5_changes);
    			const block6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				block6_changes.$$scope = { dirty, ctx };
    			}

    			block6.$set(block6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parallaximage0.$$.fragment, local);
    			transition_in(block0.$$.fragment, local);
    			transition_in(block1.$$.fragment, local);
    			transition_in(block2.$$.fragment, local);
    			transition_in(parallaximage1.$$.fragment, local);
    			transition_in(block3.$$.fragment, local);
    			transition_in(block4.$$.fragment, local);
    			transition_in(parallaximage2.$$.fragment, local);
    			transition_in(block5.$$.fragment, local);
    			transition_in(block6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parallaximage0.$$.fragment, local);
    			transition_out(block0.$$.fragment, local);
    			transition_out(block1.$$.fragment, local);
    			transition_out(block2.$$.fragment, local);
    			transition_out(parallaximage1.$$.fragment, local);
    			transition_out(block3.$$.fragment, local);
    			transition_out(block4.$$.fragment, local);
    			transition_out(parallaximage2.$$.fragment, local);
    			transition_out(block5.$$.fragment, local);
    			transition_out(block6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parallaximage0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(block0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(block1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(block2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(parallaximage1, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(block3, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(block4, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(parallaximage2, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(block5, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(block6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Block,
    		Card,
    		MapFrame,
    		ParallaxImage,
    		Title,
    		ContactCard,
    		ContactDetails,
    		SearchPanel,
    		DatePicker
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    const properties = [
      {
        type: 'Apartment',
        price: 725000,
        description:
          'Fugiat et ad magna reprehenderit consectetur consequat Lorem do nulla esse dolor ut do quis. Ut commodo ullamco est est laborum. Aliquip labore enim velit incididunt consequat ad reprehenderit.',
        location: {
          postcode: 'SW1X',
          street: 'Cadogan Lane',
          city: 'Belgravia',
          county: 'London',
        },
        details: {
          bedrooms: 3,
          bathrooms: 1,
        },
        amenities: {
          garden: {
            front: false,
            rear: false,
            communal: true,
          },
          balcony: false,
          parking: {
            driveway: false,
            street: false,
            garage: false,
            secured: true,
          },
          pool: {
            indoor: false,
            outdoor: false,
          },
        },
        images: [
          'https://images.unsplash.com/photo-1515263487990-61b07816b324?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=973&q=80',
          'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1060&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
        ],
      },
      {
        type: 'Apartment',
        price: 830000,
        description:
          'Fugiat et ad magna reprehenderit consectetur consequat Lorem do nulla esse dolor ut do quis. Ut commodo ullamco est est laborum. Aliquip labore enim velit incididunt consequat ad reprehenderit.',
        location: {
          postcode: 'WC1B',
          street: "Short's Garden",
          city: 'Fitzrovia',
          county: 'London',
        },
        details: {
          bedrooms: 2,
          bathrooms: 1,
        },
        amenities: {
          garden: {
            front: false,
            rear: true,
            communal: false,
          },
          balcony: true,
          parking: {
            driveway: false,
            street: true,
            garage: false,
            secured: false,
          },
          pool: {
            indoor: false,
            outdoor: false,
          },
        },
        images: [
          'https://images.unsplash.com/photo-1514457429575-38c99a6eb540?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=675&q=80',
          'https://images.unsplash.com/photo-1526055577108-80193f001dde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          'https://images.unsplash.com/photo-1541123356219-284ebe98ae3b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          'https://images.unsplash.com/photo-1553444836-bc6c8d340ba7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          'https://images.unsplash.com/photo-1474265648294-a4236906a526?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1055&q=80',
          'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
        ],
      },
      {
        type: 'Apartment',
        price: 675000,
        description:
          'Fugiat et ad magna reprehenderit consectetur consequat Lorem do nulla esse dolor ut do quis. Ut commodo ullamco est est laborum. Aliquip labore enim velit incididunt consequat ad reprehenderit.',
        location: {
          postcode: 'E14',
          street: 'Marsh Wall',
          city: 'Poplar',
          county: 'London',
        },
        details: {
          bedrooms: 2,
          bathrooms: 1,
        },
        amenities: {
          garden: {
            front: false,
            rear: false,
            communal: false,
          },
          balcony: true,
          parking: {
            driveway: false,
            street: false,
            garage: false,
            secured: false,
          },
          pool: {
            indoor: false,
            outdoor: false,
          },
        },
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          'https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
          'https://images.unsplash.com/photo-1536228954132-243bb670c35a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=701&q=80',
        ],
      },
    ];

    const numberWithCommas = num =>
      num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    /* src/_atoms/SearchDisplay.svelte generated by Svelte v3.29.0 */
    const file$g = "src/_atoms/SearchDisplay.svelte";

    function create_fragment$g(ctx) {
    	let p;
    	let t0;
    	let strong0;
    	let t1_value = (/*data*/ ctx[0].buy ? "buy" : "rent") + "";
    	let t1;
    	let t2;
    	let strong1;
    	let t3_value = /*data*/ ctx[0].area + "";
    	let t3;
    	let t4;
    	let strong2;
    	let t5;
    	let t6_value = numberWithCommas(/*data*/ ctx[0].min) + "";
    	let t6;
    	let t7;
    	let strong3;
    	let t8;
    	let t9_value = numberWithCommas(/*data*/ ctx[0].max) + "";
    	let t9;
    	let t10;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Your're looking for a property to\n  ");
    			strong0 = element("strong");
    			t1 = text(t1_value);
    			t2 = text("\n  in\n  ");
    			strong1 = element("strong");
    			t3 = text(t3_value);
    			t4 = text("\n  between\n  ");
    			strong2 = element("strong");
    			t5 = text("£");
    			t6 = text(t6_value);
    			t7 = text("\n  and\n  ");
    			strong3 = element("strong");
    			t8 = text("£");
    			t9 = text(t9_value);
    			t10 = text(".");
    			add_location(strong0, file$g, 13, 2, 205);
    			add_location(strong1, file$g, 15, 2, 257);
    			add_location(strong2, file$g, 17, 2, 298);
    			add_location(strong3, file$g, 19, 2, 353);
    			attr_dev(p, "class", "svelte-8ntlx0");
    			add_location(p, file$g, 11, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, strong0);
    			append_dev(strong0, t1);
    			append_dev(p, t2);
    			append_dev(p, strong1);
    			append_dev(strong1, t3);
    			append_dev(p, t4);
    			append_dev(p, strong2);
    			append_dev(strong2, t5);
    			append_dev(strong2, t6);
    			append_dev(p, t7);
    			append_dev(p, strong3);
    			append_dev(strong3, t8);
    			append_dev(strong3, t9);
    			append_dev(p, t10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = (/*data*/ ctx[0].buy ? "buy" : "rent") + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 1 && t3_value !== (t3_value = /*data*/ ctx[0].area + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*data*/ 1 && t6_value !== (t6_value = numberWithCommas(/*data*/ ctx[0].min) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*data*/ 1 && t9_value !== (t9_value = numberWithCommas(/*data*/ ctx[0].max) + "")) set_data_dev(t9, t9_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SearchDisplay", slots, []);
    	let { data } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ numberWithCommas, data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class SearchDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchDisplay",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<SearchDisplay> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<SearchDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SearchDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_molecules/PropertySearchCard.svelte generated by Svelte v3.29.0 */
    const file$h = "src/_molecules/PropertySearchCard.svelte";

    // (18:0) <Card {style}>
    function create_default_slot$3(ctx) {
    	let a;
    	let t0;
    	let span;
    	let t2;
    	let searchdisplay;
    	let current;

    	searchdisplay = new SearchDisplay({
    			props: { data: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text("◂ ");
    			span = element("span");
    			span.textContent = "Go Back";
    			t2 = space();
    			create_component(searchdisplay.$$.fragment);
    			attr_dev(span, "class", "svelte-1o7p2ec");
    			add_location(span, file$h, 18, 22, 471);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-1o7p2ec");
    			add_location(a, file$h, 18, 2, 451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, span);
    			insert_dev(target, t2, anchor);
    			mount_component(searchdisplay, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const searchdisplay_changes = {};
    			if (dirty & /*data*/ 1) searchdisplay_changes.data = /*data*/ ctx[0];
    			searchdisplay.$set(searchdisplay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(searchdisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(searchdisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    			destroy_component(searchdisplay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(18:0) <Card {style}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				style: /*style*/ ctx[1],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};
    			if (dirty & /*style*/ 2) card_changes.style = /*style*/ ctx[1];

    			if (dirty & /*$$scope, data*/ 5) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PropertySearchCard", slots, []);
    	let { data } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["data", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PropertySearchCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ Card, SearchDisplay, data, style });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, style];
    }

    class PropertySearchCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { data: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PropertySearchCard",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<PropertySearchCard> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<PropertySearchCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<PropertySearchCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<PropertySearchCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<PropertySearchCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/AmenityIcons.svelte generated by Svelte v3.29.0 */

    const file$i = "src/_atoms/AmenityIcons.svelte";

    // (37:2) {#if amenity.garden.front || amenity.garden.rear || amenity.garden.communal}
    function create_if_block_3$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = "/images/gardening-tools.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "garden");
    			attr_dev(img, "class", "svelte-1pt6qfx");
    			add_location(img, file$i, 38, 6, 961);
    			attr_dev(div, "class", "icon svelte-1pt6qfx");
    			add_location(div, file$i, 37, 4, 936);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(37:2) {#if amenity.garden.front || amenity.garden.rear || amenity.garden.communal}",
    		ctx
    	});

    	return block;
    }

    // (42:2) {#if amenity.balcony}
    function create_if_block_2$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = "/images/balcony.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "balcony");
    			attr_dev(img, "class", "svelte-1pt6qfx");
    			add_location(img, file$i, 42, 22, 1081);
    			attr_dev(div, "class", "icon svelte-1pt6qfx");
    			add_location(div, file$i, 42, 4, 1063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(42:2) {#if amenity.balcony}",
    		ctx
    	});

    	return block;
    }

    // (45:2) {#if amenity.parking.driveway || amenity.parking.street || amenity.parking.garage || amenity.parking.secured}
    function create_if_block_1$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = "/images/car-of-hatchback-model.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "parking");
    			attr_dev(img, "class", "svelte-1pt6qfx");
    			add_location(img, file$i, 46, 6, 1284);
    			attr_dev(div, "class", "icon svelte-1pt6qfx");
    			add_location(div, file$i, 45, 4, 1259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(45:2) {#if amenity.parking.driveway || amenity.parking.street || amenity.parking.garage || amenity.parking.secured}",
    		ctx
    	});

    	return block;
    }

    // (50:2) {#if amenity.pool.indoor || amenity.pool.outdoor}
    function create_if_block$5(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = "/images/springboard.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "pool");
    			attr_dev(img, "class", "svelte-1pt6qfx");
    			add_location(img, file$i, 50, 22, 1440);
    			attr_dev(div, "class", "icon svelte-1pt6qfx");
    			add_location(div, file$i, 50, 4, 1422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(50:2) {#if amenity.pool.indoor || amenity.pool.outdoor}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1_value = /*data*/ ctx[0].details.bedrooms + "";
    	let t1;
    	let t2;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let t4_value = /*data*/ ctx[0].details.bathrooms + "";
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let if_block0 = (/*amenity*/ ctx[2].garden.front || /*amenity*/ ctx[2].garden.rear || /*amenity*/ ctx[2].garden.communal) && create_if_block_3$1(ctx);
    	let if_block1 = /*amenity*/ ctx[2].balcony && create_if_block_2$1(ctx);
    	let if_block2 = (/*amenity*/ ctx[2].parking.driveway || /*amenity*/ ctx[2].parking.street || /*amenity*/ ctx[2].parking.garage || /*amenity*/ ctx[2].parking.secured) && create_if_block_1$2(ctx);
    	let if_block3 = (/*amenity*/ ctx[2].pool.indoor || /*amenity*/ ctx[2].pool.outdoor) && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			if (if_block2) if_block2.c();
    			t8 = space();
    			if (if_block3) if_block3.c();
    			if (img0.src !== (img0_src_value = "/images/bed.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "bedroom");
    			attr_dev(img0, "class", "svelte-1pt6qfx");
    			add_location(img0, file$i, 29, 4, 663);
    			attr_dev(div0, "class", "icon svelte-1pt6qfx");
    			add_location(div0, file$i, 28, 2, 640);
    			if (img1.src !== (img1_src_value = "/images/bath.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "bathroom");
    			attr_dev(img1, "class", "svelte-1pt6qfx");
    			add_location(img1, file$i, 33, 4, 769);
    			attr_dev(div1, "class", "icon svelte-1pt6qfx");
    			add_location(div1, file$i, 32, 2, 746);
    			attr_dev(div2, "class", "wrapper svelte-1pt6qfx");
    			attr_dev(div2, "style", /*style*/ ctx[1]);
    			add_location(div2, file$i, 27, 0, 608);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, img1);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div2, t5);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t6);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t7);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t8);
    			if (if_block3) if_block3.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*data*/ ctx[0].details.bedrooms + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 1 && t4_value !== (t4_value = /*data*/ ctx[0].details.bathrooms + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*style*/ 2) {
    				attr_dev(div2, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AmenityIcons", slots, []);
    	let { data } = $$props;
    	let { style = "" } = $$props;
    	let amenity = data.amenities;
    	const writable_props = ["data", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AmenityIcons> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ data, style, amenity });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("amenity" in $$props) $$invalidate(2, amenity = $$props.amenity);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, style, amenity];
    }

    class AmenityIcons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { data: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AmenityIcons",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<AmenityIcons> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<AmenityIcons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<AmenityIcons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<AmenityIcons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<AmenityIcons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/Slideshow.svelte generated by Svelte v3.29.0 */
    const file$j = "src/_atoms/Slideshow.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (81:4) {#each array as img, i}
    function create_each_block$1(ctx) {
    	let div;
    	let div_style_value;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[5](/*i*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "img svelte-13l5hcj");
    			attr_dev(div, "style", div_style_value = `background-image: url(${/*img*/ ctx[8]});`);
    			add_location(div, file$j, 81, 6, 1949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*array*/ 1 && div_style_value !== (div_style_value = `background-image: url(${/*img*/ ctx[8]});`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(81:4) {#each array as img, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div2;
    	let button0;
    	let t1;
    	let div1;
    	let t2;
    	let div0;
    	let div1_style_value;
    	let t3;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*array*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "◂";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "▸";
    			attr_dev(button0, "class", "prev svelte-13l5hcj");
    			add_location(button0, file$j, 78, 2, 1787);
    			attr_dev(div0, "class", "div img svelte-13l5hcj");
    			add_location(div0, file$j, 86, 4, 2082);
    			attr_dev(div1, "class", "slider svelte-13l5hcj");
    			attr_dev(div1, "style", div1_style_value = `left: -${12 * /*count*/ ctx[1]}rem;`);
    			add_location(div1, file$j, 79, 2, 1859);
    			attr_dev(button1, "class", "next svelte-13l5hcj");
    			add_location(button1, file$j, 88, 2, 2117);
    			attr_dev(div2, "class", "wrapper svelte-13l5hcj");
    			add_location(div2, file$j, 77, 0, 1763);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, button0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div2, t3);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*array, handleClick*/ 9) {
    				each_value = /*array*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*count*/ 2 && div1_style_value !== (div1_style_value = `left: -${12 * /*count*/ ctx[1]}rem;`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slideshow", slots, []);
    	const dispatch = createEventDispatcher();
    	let { array = [] } = $$props;
    	let count = 0;

    	const iterateImg = iterator => {
    		if (iterator > 0) {
    			if (count + 1 === array.length) {
    				$$invalidate(1, count = 0);
    			} else {
    				$$invalidate(1, count = count + iterator);
    			}
    		} else {
    			if (count === 0) {
    				$$invalidate(1, count = array.length - 1);
    			} else {
    				$$invalidate(1, count = count + iterator);
    			}
    		}
    	};

    	const handleClick = index => {
    		dispatch("changeImg", index);
    	};

    	const writable_props = ["array"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slideshow> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => iterateImg(-1);
    	const click_handler_1 = i => handleClick(i);
    	const click_handler_2 = () => iterateImg(1);

    	$$self.$$set = $$props => {
    		if ("array" in $$props) $$invalidate(0, array = $$props.array);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		array,
    		count,
    		iterateImg,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("array" in $$props) $$invalidate(0, array = $$props.array);
    		if ("count" in $$props) $$invalidate(1, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		array,
    		count,
    		iterateImg,
    		handleClick,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Slideshow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { array: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slideshow",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get array() {
    		throw new Error("<Slideshow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set array(value) {
    		throw new Error("<Slideshow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_organisms/PropertyCard.svelte generated by Svelte v3.29.0 */
    const file$k = "src/_organisms/PropertyCard.svelte";

    function create_fragment$k(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let p0;
    	let t1_value = /*data*/ ctx[0].details.bedrooms + "";
    	let t1;
    	let t2;
    	let t3_value = /*data*/ ctx[0].type + "";
    	let t3;
    	let t4;
    	let t5_value = /*data*/ ctx[0].location.city + "";
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let t8_value = numberWithCommas(/*data*/ ctx[0].price) + "";
    	let t8;
    	let t9;
    	let div1;
    	let amenityicons;
    	let div1_style_value;
    	let t10;
    	let slideshow;
    	let t11;
    	let div2;
    	let current;

    	amenityicons = new AmenityIcons({
    			props: {
    				data: /*data*/ ctx[0],
    				style: "position: absolute;\n    bottom: 0; right: 0;"
    			},
    			$$inline: true
    		});

    	slideshow = new Slideshow({
    			props: { array: /*data*/ ctx[0].images },
    			$$inline: true
    		});

    	slideshow.$on("changeImg", /*changeImg*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = text("\n    bedroom\n    ");
    			t3 = text(t3_value);
    			t4 = text("\n    in\n    ");
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			t7 = text("£");
    			t8 = text(t8_value);
    			t9 = space();
    			div1 = element("div");
    			create_component(amenityicons.$$.fragment);
    			t10 = space();
    			create_component(slideshow.$$.fragment);
    			t11 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "property__styling-top svelte-1a5v5j6");
    			add_location(div0, file$k, 43, 2, 1174);
    			attr_dev(p0, "class", "property__title svelte-1a5v5j6");
    			add_location(p0, file$k, 44, 2, 1214);
    			attr_dev(p1, "class", "property__price svelte-1a5v5j6");
    			add_location(p1, file$k, 51, 2, 1339);
    			attr_dev(div1, "class", "property__cover-image svelte-1a5v5j6");
    			attr_dev(div1, "style", div1_style_value = `background-image: url(${/*data*/ ctx[0].images[/*index*/ ctx[1]]})`);
    			add_location(div1, file$k, 52, 2, 1404);
    			attr_dev(div2, "class", "property__styling-bottom svelte-1a5v5j6");
    			add_location(div2, file$k, 59, 2, 1656);
    			attr_dev(div3, "class", "property svelte-1a5v5j6");
    			add_location(div3, file$k, 42, 0, 1149);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, p0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div3, t6);
    			append_dev(div3, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(div3, t9);
    			append_dev(div3, div1);
    			mount_component(amenityicons, div1, null);
    			append_dev(div3, t10);
    			mount_component(slideshow, div3, null);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*data*/ 1) && t1_value !== (t1_value = /*data*/ ctx[0].details.bedrooms + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*data*/ 1) && t3_value !== (t3_value = /*data*/ ctx[0].type + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty & /*data*/ 1) && t5_value !== (t5_value = /*data*/ ctx[0].location.city + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*data*/ 1) && t8_value !== (t8_value = numberWithCommas(/*data*/ ctx[0].price) + "")) set_data_dev(t8, t8_value);
    			const amenityicons_changes = {};
    			if (dirty & /*data*/ 1) amenityicons_changes.data = /*data*/ ctx[0];
    			amenityicons.$set(amenityicons_changes);

    			if (!current || dirty & /*data, index*/ 3 && div1_style_value !== (div1_style_value = `background-image: url(${/*data*/ ctx[0].images[/*index*/ ctx[1]]})`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}

    			const slideshow_changes = {};
    			if (dirty & /*data*/ 1) slideshow_changes.array = /*data*/ ctx[0].images;
    			slideshow.$set(slideshow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(amenityicons.$$.fragment, local);
    			transition_in(slideshow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(amenityicons.$$.fragment, local);
    			transition_out(slideshow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(amenityicons);
    			destroy_component(slideshow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PropertyCard", slots, []);
    	let { data } = $$props;
    	let index = 0;
    	const changeImg = e => $$invalidate(1, index = e.detail);
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PropertyCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		numberWithCommas,
    		AmenityIcons,
    		Slideshow,
    		data,
    		index,
    		changeImg
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, index, changeImg];
    }

    class PropertyCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PropertyCard",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<PropertyCard> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<PropertyCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<PropertyCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_views/Properties.svelte generated by Svelte v3.29.0 */
    const file$l = "src/_views/Properties.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (20:4) <Card       low       style="width: calc(100% - 2rem); margin-left: 1rem; margin-bottom: 1rem;">
    function create_default_slot$4(ctx) {
    	let propertycard;
    	let t;
    	let current;

    	propertycard = new PropertyCard({
    			props: { data: /*property*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(propertycard.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(propertycard, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(propertycard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(propertycard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(propertycard, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(20:4) <Card       low       style=\\\"width: calc(100% - 2rem); margin-left: 1rem; margin-bottom: 1rem;\\\">",
    		ctx
    	});

    	return block;
    }

    // (19:2) {#each properties as property}
    function create_each_block$2(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				low: true,
    				style: "width: calc(100% - 2rem); margin-left: 1rem; margin-bottom: 1rem;",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(19:2) {#each properties as property}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let propertysearchcard;
    	let t;
    	let current;

    	propertysearchcard = new PropertySearchCard({
    			props: {
    				data: /*$Search*/ ctx[0],
    				style: "width: calc(100% - 2rem); margin: 1rem auto; padding: 1rem;"
    			},
    			$$inline: true
    		});

    	let each_value = properties;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(propertysearchcard.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wrapper svelte-6aqbs8");
    			add_location(div, file$l, 14, 0, 507);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(propertysearchcard, div, null);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const propertysearchcard_changes = {};
    			if (dirty & /*$Search*/ 1) propertysearchcard_changes.data = /*$Search*/ ctx[0];
    			propertysearchcard.$set(propertysearchcard_changes);

    			if (dirty & /*properties*/ 0) {
    				each_value = properties;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(propertysearchcard.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(propertysearchcard.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(propertysearchcard);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $Search;
    	validate_store(Search, "Search");
    	component_subscribe($$self, Search, $$value => $$invalidate(0, $Search = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Properties", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Properties> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Search,
    		properties,
    		Card,
    		PropertySearchCard,
    		PropertyCard,
    		$Search
    	});

    	return [$Search];
    }

    class Properties extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Properties",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/_views/NotFound.svelte generated by Svelte v3.29.0 */

    const file$m = "src/_views/NotFound.svelte";

    function create_fragment$m(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "404";
    			add_location(h1, file$m, 5, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    const scrollY = writable(0);

    /* src/_atoms/LogoSVG.svelte generated by Svelte v3.29.0 */

    const file$n = "src/_atoms/LogoSVG.svelte";

    function create_fragment$n(ctx) {
    	let svg;
    	let path;
    	let path_style_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "style", path_style_value = `font-size:13.9386px;line-height:1.25;font-family:'Playfair Display';-inkscape-font-specification:'Playfair Display';letter-spacing:3.78952px;word-spacing:0px;stroke-width:0.264583;fill:${/*white*/ ctx[1] ? "#ffffff" : "#080708"}`);
    			attr_dev(path, "d", "m 120.72263,22.166811 q -0.0557,0.487851 -0.0836,0.947825 -0.0139,0.459973 -0.0139,0.69693 0,0.250894 0.0139,0.487851 0.0139,0.223017 0.0279,0.376342 h -0.32059 q -0.0836,-0.822378 -0.23696,-1.29629 -0.15332,-0.487851 -0.52966,-0.682991 -0.36241,-0.209079 -1.10115,-0.209079 h -1.15691 q -0.47391,0 -0.7248,0.08363 -0.23696,0.06969 -0.32059,0.320588 -0.0836,0.236956 -0.0836,0.752684 v 6.913546 q 0,0.501789 0.0836,0.752684 0.0836,0.250895 0.32059,0.334527 0.25089,0.06969 0.7248,0.06969 h 1.01752 q 0.87813,0 1.32417,-0.236957 0.45997,-0.236956 0.65511,-0.766623 0.20908,-0.543605 0.30665,-1.463553 h 0.32059 q -0.0418,0.376343 -0.0418,1.00358 0,0.264833 0.0139,0.766623 0.0279,0.487851 0.0836,1.017517 -0.71087,-0.02788 -1.60294,-0.02788 -0.89207,-0.01394 -1.589,-0.01394 -0.41815,0 -1.11508,0 -0.683,0 -1.46356,0.01394 -0.78056,0 -1.46355,0.02788 v -0.278772 q 0.47391,-0.02788 0.71087,-0.111508 0.25089,-0.08363 0.33452,-0.334527 0.0836,-0.250895 0.0836,-0.752684 v -6.913546 q 0,-0.515728 -0.0836,-0.752684 -0.0836,-0.250895 -0.33452,-0.334526 -0.23696,-0.09757 -0.71087,-0.111509 v -0.278772 q 0.68299,0.01394 1.46355,0.02788 0.78056,0.01394 1.46356,0.01394 0.69693,0 1.11508,0 0.64118,0 1.44962,0 0.82237,-0.01394 1.46355,-0.04182 z m -2.39744,4.767001 q 0,0 0,0.139386 0,0.139386 0,0.139386 h -2.55076 q 0,0 0,-0.139386 0,-0.139386 0,-0.139386 z m 0.40422,-1.839895 q -0.0558,0.7945 -0.0558,1.212658 0.0139,0.418158 0.0139,0.766623 0,0.348465 0.0139,0.766623 0.0139,0.418158 0.0697,1.212658 h -0.32059 q -0.0558,-0.446035 -0.13939,-0.864193 -0.0697,-0.432097 -0.33452,-0.69693 -0.2509,-0.278772 -0.8642,-0.278772 v -0.278772 q 0.6133,0 0.85026,-0.320588 0.25089,-0.320588 0.32059,-0.752684 0.0697,-0.432097 0.12544,-0.766623 z M 104.98076,21.97167 q 0.91995,0 1.50537,0.278772 0.59936,0.264834 1.05933,0.627237 0.27877,0.209079 0.41816,0.05575 0.15332,-0.167263 0.20908,-0.766623 h 0.32059 q -0.0279,0.515728 -0.0418,1.254474 -0.0139,0.738746 -0.0139,1.951404 H 108.117 q -0.0976,-0.59936 -0.1812,-0.947825 -0.0836,-0.362404 -0.20908,-0.613298 -0.11151,-0.250895 -0.30665,-0.50179 -0.43209,-0.571483 -1.08721,-0.822377 -0.65511,-0.264834 -1.37992,-0.264834 -0.68299,0 -1.24053,0.348465 -0.54361,0.334527 -0.94783,0.975702 -0.39028,0.641176 -0.6133,1.547185 -0.20908,0.906009 -0.20908,2.035035 0,1.170843 0.23696,2.076852 0.23696,0.89207 0.65511,1.505368 0.4321,0.613299 1.00358,0.933887 0.58542,0.306649 1.25448,0.306649 0.62723,0 1.31023,-0.250895 0.68299,-0.250895 1.07327,-0.808439 0.30665,-0.404219 0.41816,-0.878132 0.12544,-0.473912 0.22301,-1.324167 h 0.32059 q 0,1.268413 0.0139,2.048975 0.0139,0.766623 0.0418,1.296289 h -0.32059 q -0.0558,-0.599359 -0.19514,-0.752684 -0.12545,-0.153325 -0.4321,0.04182 -0.51573,0.362403 -1.10115,0.641175 -0.57148,0.264834 -1.47749,0.264834 -1.32417,0 -2.32775,-0.59936 -0.98964,-0.59936 -1.54718,-1.728386 -0.54361,-1.129027 -0.54361,-2.718027 0,-1.561123 0.57149,-2.731966 0.57148,-1.170842 1.56112,-1.825956 1.00358,-0.655115 2.29987,-0.655114 z m -9.340787,0.195141 v 0.278772 q -0.473913,0.01394 -0.724808,0.139386 -0.236956,0.125447 -0.320587,0.404219 -0.08363,0.278772 -0.08363,0.7945 v 8.321344 q -0.08363,0 -0.167263,0 -0.06969,0 -0.153325,0 l -5.854212,-9.046151 v 7.359581 q 0,0.501789 0.08363,0.7945 0.09757,0.278772 0.362404,0.404219 0.278772,0.111509 0.822377,0.139386 v 0.278772 q -0.250895,-0.02788 -0.655114,-0.02788 -0.40422,-0.01394 -0.766623,-0.01394 -0.348465,0 -0.710869,0.01394 -0.348465,0 -0.585421,0.02788 v -0.278772 q 0.473912,-0.02788 0.710869,-0.139386 0.250894,-0.125447 0.334526,-0.404219 0.08363,-0.292711 0.08363,-0.7945 v -6.77416 q 0,-0.515728 -0.08363,-0.752684 -0.08363,-0.250895 -0.334526,-0.334526 -0.236957,-0.09757 -0.710869,-0.111509 v -0.278772 q 0.236956,0.01394 0.585421,0.02788 0.362404,0.01394 0.710869,0.01394 0.306649,0 0.585421,-0.01394 0.278772,-0.01394 0.50179,-0.02788 l 4.920325,7.582598 v -5.965721 q 0,-0.515728 -0.09757,-0.7945 -0.08363,-0.278772 -0.362404,-0.404219 -0.264833,-0.125448 -0.808438,-0.139386 v -0.278772 q 0.250894,0.01394 0.655114,0.02788 0.418158,0.01394 0.766623,0.01394 0.362403,0 0.710868,-0.01394 0.362404,-0.01394 0.585422,-0.02788 z m -14.081432,0 q -0.05575,0.487851 -0.08363,0.947825 -0.01394,0.459973 -0.01394,0.69693 0,0.250894 0.01394,0.487851 0.01394,0.223017 0.02788,0.376342 h -0.320588 q -0.08363,-0.822378 -0.236956,-1.29629 -0.153325,-0.487851 -0.529667,-0.682991 -0.362403,-0.209079 -1.101149,-0.209079 h -1.156904 q -0.473912,0 -0.724807,0.08363 -0.236956,0.06969 -0.320588,0.320588 -0.08363,0.236956 -0.08363,0.752684 v 6.913546 q 0,0.501789 0.08363,0.752684 0.08363,0.250895 0.320588,0.334527 0.250895,0.06969 0.724807,0.06969 h 1.017518 q 0.878132,0 1.324167,-0.236957 0.459974,-0.236956 0.655114,-0.766623 0.209079,-0.543605 0.306649,-1.463553 h 0.320588 q -0.04182,0.376343 -0.04182,1.00358 0,0.264833 0.01394,0.766623 0.02788,0.487851 0.08363,1.017517 -0.710868,-0.02788 -1.602939,-0.02788 -0.89207,-0.01394 -1.589,-0.01394 -0.418158,0 -1.115088,0 -0.682991,0 -1.463553,0.01394 -0.780561,0 -1.463553,0.02788 v -0.278772 q 0.473913,-0.02788 0.710869,-0.111508 0.250895,-0.08363 0.334526,-0.334527 0.08363,-0.250895 0.08363,-0.752684 v -6.913546 q 0,-0.515728 -0.08363,-0.752684 -0.08363,-0.250895 -0.334526,-0.334526 -0.236956,-0.09757 -0.710869,-0.111509 v -0.278772 q 0.682992,0.01394 1.463553,0.02788 0.780562,0.01394 1.463553,0.01394 0.69693,0 1.115088,0 0.641176,0 1.449614,0 0.822378,-0.01394 1.463553,-0.04182 z m -2.397439,4.767001 q 0,0 0,0.139386 0,0.139386 0,0.139386 h -2.550764 q 0,0 0,-0.139386 0,-0.139386 0,-0.139386 z m 0.40422,-1.839895 q -0.05575,0.7945 -0.05575,1.212658 0.01394,0.418158 0.01394,0.766623 0,0.348465 0.01394,0.766623 0.01394,0.418158 0.06969,1.212658 H 79.28655 q -0.05576,-0.446035 -0.139386,-0.864193 -0.06969,-0.432097 -0.334527,-0.69693 -0.250895,-0.278772 -0.864193,-0.278772 v -0.278772 q 0.613298,0 0.850255,-0.320588 0.250894,-0.320588 0.320587,-0.752684 0.06969,-0.432097 0.125448,-0.766623 z M 66.173631,22.166811 v 0.278772 q -0.473913,0.01394 -0.724808,0.111509 -0.236956,0.08363 -0.320587,0.334526 -0.08363,0.236956 -0.08363,0.752684 v 6.913546 q 0,0.501789 0.08363,0.752684 0.08363,0.250895 0.320587,0.334527 0.250895,0.06969 0.724808,0.06969 h 1.017517 q 0.878132,0 1.324167,-0.250895 0.459974,-0.250895 0.655115,-0.822378 0.209079,-0.571482 0.306649,-1.533246 h 0.320587 q -0.04181,0.432097 -0.04181,1.142966 0,0.264833 0.01394,0.766623 0.02788,0.487851 0.08363,1.017517 -0.710869,-0.02788 -1.602939,-0.02788 -0.89207,-0.01394 -1.589,-0.01394 -0.418158,0 -1.115088,0 -0.682992,0 -1.463553,0.01394 -0.780562,0 -1.463553,0.02788 v -0.278772 q 0.473912,-0.02788 0.710868,-0.111508 0.250895,-0.08363 0.334527,-0.334527 0.08363,-0.250895 0.08363,-0.752684 v -6.913546 q 0,-0.515728 -0.08363,-0.752684 -0.08363,-0.250895 -0.334527,-0.334526 -0.236956,-0.09757 -0.710868,-0.111509 v -0.278772 q 0.29271,0.01394 0.766623,0.02788 0.473912,0.01394 1.017517,0.01394 0.487851,0 0.961764,-0.01394 0.487851,-0.01394 0.808439,-0.02788 z m -8.300618,0 v 0.278772 q -0.473912,0.01394 -0.724807,0.139386 -0.236956,0.125447 -0.320588,0.404219 -0.08363,0.278772 -0.08363,0.7945 v 4.195519 q 0,0.975702 -0.125448,1.700509 -0.125447,0.724807 -0.446035,1.254474 -0.348465,0.585421 -1.017518,0.947825 -0.669053,0.348465 -1.533246,0.348465 -0.669052,0 -1.282351,-0.167263 -0.59936,-0.153325 -1.059333,-0.585422 -0.40422,-0.39028 -0.641176,-0.822377 -0.223018,-0.432097 -0.306649,-1.059334 -0.08363,-0.627237 -0.08363,-1.575061 v -4.376721 q 0,-0.515728 -0.08363,-0.752684 -0.08363,-0.250895 -0.334527,-0.334526 -0.236956,-0.09757 -0.710868,-0.111509 v -0.278772 q 0.29271,0.01394 0.766623,0.02788 0.473912,0.01394 1.017517,0.01394 0.487851,0 0.961764,-0.01394 0.487851,-0.01394 0.808439,-0.02788 v 0.278772 q -0.473913,0.01394 -0.724808,0.111509 -0.236956,0.08363 -0.320587,0.334526 -0.08363,0.236956 -0.08363,0.752684 v 4.613677 q 0,0.947825 0.139386,1.742325 0.139386,0.7945 0.59936,1.268412 0.473912,0.473913 1.463553,0.473913 1.059333,0 1.630816,-0.459974 0.585421,-0.473912 0.808439,-1.29629 0.236956,-0.822377 0.236956,-1.853834 v -4.348843 q 0,-0.515728 -0.125448,-0.7945 -0.111508,-0.278772 -0.39028,-0.404219 -0.278772,-0.125448 -0.752685,-0.139386 v -0.278772 q 0.250895,0.01394 0.655114,0.02788 0.418158,0.01394 0.766623,0.01394 0.362404,0 0.710869,-0.01394 0.362404,-0.01394 0.585421,-0.02788 z m -20.50103,0 q 0.29271,0.01394 0.766623,0.02788 0.473912,0.01394 0.933886,0.01394 0.655114,0 1.254474,-0.01394 0.59936,-0.01394 0.850254,-0.01394 1.686571,0 2.522887,0.766623 0.836316,0.766623 0.836316,1.979282 0,0.501789 -0.167263,1.059333 -0.167263,0.543606 -0.585421,1.017518 -0.40422,0.459974 -1.115088,0.752684 -0.710869,0.292711 -1.79808,0.292711 H 39.532466 V 27.77013 h 1.198719 q 0.989641,0 1.505369,-0.376342 0.529667,-0.376342 0.710869,-0.989641 0.19514,-0.613298 0.19514,-1.324167 0,-1.324167 -0.529667,-1.979281 -0.515728,-0.655114 -1.784141,-0.655114 -0.641175,0 -0.836315,0.236956 -0.195141,0.236956 -0.195141,0.961763 v 6.913546 q 0,0.501789 0.09757,0.752684 0.111509,0.250895 0.418158,0.334527 0.306649,0.08363 0.892071,0.111508 v 0.278772 q -0.362404,-0.02788 -0.919948,-0.02788 -0.557544,-0.01394 -1.129026,-0.01394 -0.543606,0 -1.017518,0.01394 -0.473913,0 -0.766623,0.02788 v -0.278772 q 0.473912,-0.02788 0.710868,-0.111508 0.250895,-0.08363 0.334527,-0.334527 0.08363,-0.250895 0.08363,-0.752684 v -6.913546 q 0,-0.515728 -0.08363,-0.752684 -0.08363,-0.250895 -0.334527,-0.334526 -0.236956,-0.09757 -0.710868,-0.111509 z M 17.636043,8.6940429 c -3.836351,-0.00333 -7.35259,1.1919857 -10.4293374,3.5522381 -7.78748101,5.973948 -9.5402335,17.757167 -3.8989867,26.210803 2.5675457,3.847557 6.9567821,6.407943 11.8798941,6.929292 7.401186,0.783764 13.569375,-2.23143 17.250626,-8.433075 5.031915,-8.477054 2.744227,-20.430653 -4.862751,-25.410336 -2.505264,-1.6399909 -5.035423,-2.4885798 -8.275981,-2.7745081 -0.56077,-0.049468 -1.115415,-0.073964 -1.663464,-0.074414 z m -0.121957,2.5647011 c 1.173474,0.0011 2.351107,0.09493 3.114022,0.282154 3.81249,0.935645 6.718995,3.782618 8.139037,7.972123 0.779193,2.298808 0.942975,3.518009 0.942062,7.005775 -0.0011,3.503403 -0.171341,4.827418 -0.95963,7.457424 -1.31164,4.37607 -4.343973,7.595441 -8.122502,8.623763 -0.948884,0.258241 -3.868959,0.436641 -4.772836,0.291457 C 15.591414,42.84919 14.946383,42.704821 14.420735,42.571045 11.551467,41.840822 8.5747514,39.166276 7.171049,36.057231 5.3293615,31.97811 4.8702369,25.503434 6.0920451,20.839555 7.4112796,15.80378 10.315644,12.561453 14.424869,11.536763 15.17142,11.350705 16.340624,11.257889 17.514086,11.258744 Z M 123.25317,23.177897 h 19.085 v 7.846345 h -19.085 z M 168.63605,-2.1103772e-6 H 165.1955 V 7.886134 h 3.44055 z M 171.48987,7.4756186 h -9.14817 v 3.0179764 h 9.14817 z m 3.54723,3.0179764 h -12.6954 v 2.298564 h 12.6954 z M 153.09105,-2.1103772e-6 h 3.44054 V 7.886134 h -3.44054 z M 150.23723,7.4756186 h 9.14816 v 3.0179764 h -9.14816 z M 146.69,10.493595 h 12.6954 v 2.298564 H 146.69 Z m 0,2.298564 h 28.3471 v 9.020716 H 146.69 Z m -4.35183,8.435906 -15.80302,1.949832 h 15.80302 z m -15.80302,1.949832 c 2.71923,0.350131 0,0 0,0 z m 0.002,7.846356 c 0,0 -0.0224,-0.0306 0,0 z m 0,0 15.8013,1.949537 v -1.949537 z m 46.69986,-7.681018 c 1.17061,0 2.4276,-1.472725 2.97601,-1.609593 0.008,-0.0017 0.0386,-0.146489 0.0454,-0.142436 0.91213,0.55062 1.6882,1.330671 2.23873,2.288314 1.13991,1.98281 1.13991,4.425732 0,6.408548 -0.55066,0.957832 -1.32689,1.737994 -2.23928,2.288637 -0.008,0.005 -0.11377,-0.09879 -0.12173,-0.09481 -0.9709,0.486367 -1.99639,-4.865689 -3.16534,-4.865689 V 27.08379 Z m -27.85309,-1.752113 h 30.87905 v 10.985755 h -30.87905 z m -3.04559,0.751625 h 3.04559 v 9.516566 h -3.04559 z");
    			add_location(path, file$n, 8, 2, 152);
    			attr_dev(svg, "viewBox", "0 0 179.35206 45.508335");
    			attr_dev(svg, "style", /*style*/ ctx[0]);
    			add_location(svg, file$n, 7, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*white*/ 2 && path_style_value !== (path_style_value = `font-size:13.9386px;line-height:1.25;font-family:'Playfair Display';-inkscape-font-specification:'Playfair Display';letter-spacing:3.78952px;word-spacing:0px;stroke-width:0.264583;fill:${/*white*/ ctx[1] ? "#ffffff" : "#080708"}`)) {
    				attr_dev(path, "style", path_style_value);
    			}

    			if (dirty & /*style*/ 1) {
    				attr_dev(svg, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LogoSVG", slots, []);
    	let { style } = $$props;
    	let { white = false } = $$props;
    	const writable_props = ["style", "white"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LogoSVG> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("white" in $$props) $$invalidate(1, white = $$props.white);
    	};

    	$$self.$capture_state = () => ({ style, white });

    	$$self.$inject_state = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("white" in $$props) $$invalidate(1, white = $$props.white);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style, white];
    }

    class LogoSVG extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { style: 0, white: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogoSVG",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*style*/ ctx[0] === undefined && !("style" in props)) {
    			console.warn("<LogoSVG> was created without expected prop 'style'");
    		}
    	}

    	get style() {
    		throw new Error("<LogoSVG>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LogoSVG>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get white() {
    		throw new Error("<LogoSVG>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set white(value) {
    		throw new Error("<LogoSVG>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_molecules/Header.svelte generated by Svelte v3.29.0 */
    const file$o = "src/_molecules/Header.svelte";

    function create_fragment$o(ctx) {
    	let header;
    	let logosvg;
    	let current;

    	logosvg = new LogoSVG({
    			props: {
    				style: "display: block; height: 8vh; margin: 2vh auto; opacity: .9;"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(logosvg.$$.fragment);
    			attr_dev(header, "style", /*style*/ ctx[0]);
    			attr_dev(header, "class", "svelte-jmj8z5");
    			add_location(header, file$o, 13, 0, 327);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(logosvg, header, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*style*/ 1) {
    				attr_dev(header, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logosvg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logosvg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(logosvg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { style = "" } = $$props;
    	const writable_props = ["style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ LogoSvg: LogoSVG, style });

    	$$self.$inject_state = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { style: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get style() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_atoms/BackToTop.svelte generated by Svelte v3.29.0 */
    const file$p = "src/_atoms/BackToTop.svelte";

    function create_fragment$p(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("TOP");
    			attr_dev(button, "style", /*style*/ ctx[0]);
    			attr_dev(button, "class", "svelte-11tgfwh");
    			add_location(button, file$p, 19, 0, 492);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*scrollToTop*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*style*/ 1) {
    				attr_dev(button, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BackToTop", slots, []);
    	const dispatch = createEventDispatcher();
    	const scrollToTop = () => dispatch("scrollToTop", "smooth");
    	let { style = "" } = $$props;
    	const writable_props = ["style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackToTop> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		scrollToTop,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style, scrollToTop];
    }

    class BackToTop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { style: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackToTop",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get style() {
    		throw new Error("<BackToTop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<BackToTop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/_molecules/Footer.svelte generated by Svelte v3.29.0 */
    const file$q = "src/_molecules/Footer.svelte";

    // (26:2) <Card     style="position: absolute; top: -1rem; left: 50%; transform: translateX(-50%);">
    function create_default_slot$5(ctx) {
    	let backtotop;
    	let current;
    	backtotop = new BackToTop({ $$inline: true });
    	backtotop.$on("scrollToTop", /*scrollToTop_handler*/ ctx[0]);

    	const block = {
    		c: function create() {
    			create_component(backtotop.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(backtotop, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backtotop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backtotop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(backtotop, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(26:2) <Card     style=\\\"position: absolute; top: -1rem; left: 50%; transform: translateX(-50%);\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let footer;
    	let card;
    	let t0;
    	let p0;
    	let t2;
    	let p1;
    	let a;
    	let current;

    	card = new Card({
    			props: {
    				style: "position: absolute; top: -1rem; left: 50%; transform: translateX(-50%);",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			create_component(card.$$.fragment);
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "2020 Opulent Properties";
    			t2 = space();
    			p1 = element("p");
    			a = element("a");
    			a.textContent = "© 2020 Martin Wheeler Web";
    			attr_dev(p0, "class", "svelte-11npbnp");
    			add_location(p0, file$q, 29, 2, 731);
    			attr_dev(a, "href", "https://martinwheelerweb.com");
    			attr_dev(a, "class", "svelte-11npbnp");
    			add_location(a, file$q, 31, 4, 772);
    			attr_dev(p1, "class", "svelte-11npbnp");
    			add_location(p1, file$q, 30, 2, 764);
    			attr_dev(footer, "class", "svelte-11npbnp");
    			add_location(footer, file$q, 24, 0, 584);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			mount_component(card, footer, null);
    			append_dev(footer, t0);
    			append_dev(footer, p0);
    			append_dev(footer, t2);
    			append_dev(footer, p1);
    			append_dev(p1, a);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	function scrollToTop_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$capture_state = () => ({ BackToTop, Card });
    	return [scrollToTop_handler];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/_atoms/PageContainer.svelte generated by Svelte v3.29.0 */
    const file$r = "src/_atoms/PageContainer.svelte";

    function create_fragment$r(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;

    	header = new Header({
    			props: {
    				style: "\nposition: fixed;\ntop: 0;\nleft: 0;"
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	footer = new Footer({ $$inline: true });
    	footer.$on("scrollToTop", /*scrollToTop_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "main svelte-131gdbk");
    			add_location(main, file$r, 17, 0, 449);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main, "scroll", /*scroll_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PageContainer", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageContainer> was created with unknown prop '${key}'`);
    	});

    	function scroll_handler(event) {
    		bubble($$self, event);
    	}

    	function scrollToTop_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ scrollY, Header, Footer });
    	return [$$scope, slots, scroll_handler, scrollToTop_handler];
    }

    class PageContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageContainer",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.0 */
    const file$s = "src/App.svelte";

    // (45:2) <PageContainer on:scrollToTop={handleScroll}>
    function create_default_slot$6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(45:2) <PageContainer on:scrollToTop={handleScroll}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let div;
    	let pagecontainer;
    	let current;

    	pagecontainer = new PageContainer({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pagecontainer.$on("scrollToTop", /*handleScroll*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pagecontainer.$$.fragment);
    			attr_dev(div, "id", "app");
    			attr_dev(div, "class", "svelte-ysbcyi");
    			add_location(div, file$s, 43, 0, 1038);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pagecontainer, div, null);
    			/*div_binding*/ ctx[3](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagecontainer_changes = {};

    			if (dirty & /*$$scope, page*/ 17) {
    				pagecontainer_changes.$$scope = { dirty, ctx };
    			}

    			pagecontainer.$set(pagecontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagecontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagecontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pagecontainer);
    			/*div_binding*/ ctx[3](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let page$1;
    	page("/", () => $$invalidate(0, page$1 = Home));
    	page("/properties", () => $$invalidate(0, page$1 = Properties));
    	page("/*", () => $$invalidate(0, page$1 = NotFound));
    	page.start();
    	let element;

    	const handleScroll = e => {
    		element
    		? element.scrollTo({ top: 0, left: 0, behavior: e.detail })
    		: null;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$capture_state = () => ({
    		router: page,
    		Home,
    		Properties,
    		NotFound,
    		PageContainer,
    		page: page$1,
    		element,
    		handleScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page$1 = $$props.page);
    		if ("element" in $$props) $$invalidate(1, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page$1, element, handleScroll, div_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
