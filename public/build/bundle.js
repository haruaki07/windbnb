
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function children(element) {
        return Array.from(element.childNodes);
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

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
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
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
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
            if (running_program) {
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.28.0' }, detail)));
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

    /* src\styles\Tailwindcss.svelte generated by Svelte v3.28.0 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tailwindcss", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwindcss> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\SearchBar.svelte generated by Svelte v3.28.0 */
    const file = "src\\SearchBar.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;

    	let t0_value = (/*location*/ ctx[0].city && /*location*/ ctx[0].country
    	? `${/*location*/ ctx[0].city},${/*location*/ ctx[0].country}`
    	: "Add location") + "";

    	let t0;
    	let div0_class_value;
    	let t1;
    	let div1;

    	let t2_value = (/*guest*/ ctx[1]
    	? `${/*guest*/ ctx[1]} guests`
    	: "Add guest") + "";

    	let t2;
    	let div1_class_value;
    	let t3;
    	let button;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			span = element("span");
    			span.textContent = "search";

    			attr_dev(div0, "class", div0_class_value = "p-3 px-4 " + (/*location*/ ctx[0].city && /*location*/ ctx[0].country
    			? "filled"
    			: "empty") + " svelte-f1e8gn");

    			add_location(div0, file, 24, 2, 556);
    			attr_dev(div1, "class", div1_class_value = "p-3 px-4 " + (/*guest*/ ctx[1] ? "filled" : "empty") + " svelte-f1e8gn");
    			add_location(div1, file, 28, 2, 753);
    			attr_dev(span, "class", "material-icons align-middle");
    			add_location(span, file, 33, 4, 933);
    			attr_dev(button, "class", "p-3 px-4 text-red-500 focus:outline-none");
    			add_location(button, file, 32, 2, 870);
    			attr_dev(div2, "class", "flex items-center rounded-large shadow text-sm cursor-pointer divide-x divide-gray-300");
    			add_location(div2, file, 21, 0, 423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, button);
    			append_dev(button, span);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*handleClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*location*/ 1 && t0_value !== (t0_value = (/*location*/ ctx[0].city && /*location*/ ctx[0].country
    			? `${/*location*/ ctx[0].city},${/*location*/ ctx[0].country}`
    			: "Add location") + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*location*/ 1 && div0_class_value !== (div0_class_value = "p-3 px-4 " + (/*location*/ ctx[0].city && /*location*/ ctx[0].country
    			? "filled"
    			: "empty") + " svelte-f1e8gn")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*guest*/ 2 && t2_value !== (t2_value = (/*guest*/ ctx[1]
    			? `${/*guest*/ ctx[1]} guests`
    			: "Add guest") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*guest*/ 2 && div1_class_value !== (div1_class_value = "p-3 px-4 " + (/*guest*/ ctx[1] ? "filled" : "empty") + " svelte-f1e8gn")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
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
    	validate_slots("SearchBar", slots, []);
    	let dispatch = createEventDispatcher();
    	let { location = {} } = $$props;
    	let { guest = 0 } = $$props;

    	function handleClick() {
    		dispatch("clicked");
    	}

    	
    	const writable_props = ["location", "guest"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("guest" in $$props) $$invalidate(1, guest = $$props.guest);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		location,
    		guest,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    		if ("guest" in $$props) $$invalidate(1, guest = $$props.guest);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*location, guest*/ 3) ;
    	};

    	return [location, guest, handleClick];
    }

    class SearchBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { location: 0, guest: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchBar",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get location() {
    		throw new Error("<SearchBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<SearchBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get guest() {
    		throw new Error("<SearchBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set guest(value) {
    		throw new Error("<SearchBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Navbar.svelte generated by Svelte v3.28.0 */
    const file$1 = "src\\Navbar.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let t;
    	let searchbar;
    	let current;

    	searchbar = new SearchBar({
    			props: {
    				location: /*filter*/ ctx[0].location,
    				guest: /*filter*/ ctx[0].guest
    			},
    			$$inline: true
    		});

    	searchbar.$on("clicked", /*handleClicked*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			create_component(searchbar.$$.fragment);
    			if (img.src !== (img_src_value = "logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo Windbnb");
    			add_location(img, file$1, 16, 4, 409);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "self-start md:mb-0 mb-5");
    			add_location(a, file$1, 15, 2, 359);
    			attr_dev(div, "class", "w-full flex flex-col md:flex-row justify-between items-center px-5\r\n  md:px-20 py-5");
    			add_location(div, file$1, 12, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(div, t);
    			mount_component(searchbar, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const searchbar_changes = {};
    			if (dirty & /*filter*/ 1) searchbar_changes.location = /*filter*/ ctx[0].location;
    			if (dirty & /*filter*/ 1) searchbar_changes.guest = /*filter*/ ctx[0].guest;
    			searchbar.$set(searchbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(searchbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(searchbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(searchbar);
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
    	validate_slots("Navbar", slots, []);
    	let dispatch = createEventDispatcher();
    	let { filter = {} } = $$props;

    	function handleClicked() {
    		dispatch("search");
    	}

    	const writable_props = ["filter"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("filter" in $$props) $$invalidate(0, filter = $$props.filter);
    	};

    	$$self.$capture_state = () => ({
    		SearchBar,
    		createEventDispatcher,
    		dispatch,
    		filter,
    		handleClicked
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("filter" in $$props) $$invalidate(0, filter = $$props.filter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [filter, handleClicked];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { filter: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get filter() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.28.0 */

    const file$2 = "src\\Footer.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let hr;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			hr = element("hr");
    			t = text("\r\n    Haruaki @ DevChallenges.io");
    			attr_dev(hr, "class", "border-gray-500 pb-6");
    			add_location(hr, file$2, 2, 4, 106);
    			attr_dev(div0, "class", "md:max-w-md w-full mx-auto text-center text-gray-500");
    			add_location(div0, file$2, 1, 2, 34);
    			attr_dev(div1, "class", "w-full py-6 px-5");
    			add_location(div1, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, hr);
    			append_dev(div0, t);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    /* node_modules\svelte-lazy\src\components\Placeholder.svelte generated by Svelte v3.28.0 */

    const file$3 = "node_modules\\svelte-lazy\\src\\components\\Placeholder.svelte";

    // (4:46) 
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*placeholder*/ ctx[0];

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
    			if (switch_value !== (switch_value = /*placeholder*/ ctx[0])) {
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(4:46) ",
    		ctx
    	});

    	return block;
    }

    // (2:2) {#if typeof placeholder === 'string'}
    function create_if_block(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*placeholder*/ ctx[0]);
    			add_location(div, file$3, 2, 4, 75);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 1) set_data_dev(t, /*placeholder*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(2:2) {#if typeof placeholder === 'string'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (typeof /*placeholder*/ ctx[0] === "string") return 0;
    		if (typeof /*placeholder*/ ctx[0] === "function") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", placeholderClass);
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

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
    					if_block.m(div, null);
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
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
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

    const placeholderClass = "svelte-lazy-placeholder";

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Placeholder", slots, []);
    	let { placeholder = null } = $$props;
    	const writable_props = ["placeholder"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Placeholder> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    	};

    	$$self.$capture_state = () => ({ placeholder, placeholderClass });

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [placeholder];
    }

    class Placeholder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { placeholder: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Placeholder",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get placeholder() {
    		throw new Error("<Placeholder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Placeholder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-lazy\src\index.svelte generated by Svelte v3.28.0 */
    const file$4 = "node_modules\\svelte-lazy\\src\\index.svelte";

    // (13:2) {:else}
    function create_else_block(ctx) {
    	let placeholder_1;
    	let current;

    	placeholder_1 = new Placeholder({
    			props: { placeholder: /*placeholder*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const placeholder_1_changes = {};
    			if (dirty & /*placeholder*/ 2) placeholder_1_changes.placeholder = /*placeholder*/ ctx[1];
    			placeholder_1.$set(placeholder_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(13:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (2:2) {#if loaded}
    function create_if_block$1(ctx) {
    	let div;
    	let div_intro;
    	let t;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);
    	let if_block = /*contentDisplay*/ ctx[3] === "hide" && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", contentClass);
    			attr_dev(div, "style", /*contentStyle*/ ctx[4]);
    			add_location(div, file$4, 2, 4, 54);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*contentStyle*/ 16) {
    				attr_dev(div, "style", /*contentStyle*/ ctx[4]);
    			}

    			if (/*contentDisplay*/ ctx[3] === "hide") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*contentDisplay*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(default_slot_or_fallback, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, /*fadeOption*/ ctx[0] || {});
    					div_intro.start();
    				});
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(2:2) {#if loaded}",
    		ctx
    	});

    	return block;
    }

    // (8:12) Lazy load content
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lazy load content");
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
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(8:12) Lazy load content",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if contentDisplay === 'hide'}
    function create_if_block_1$1(ctx) {
    	let placeholder_1;
    	let current;

    	placeholder_1 = new Placeholder({
    			props: { placeholder: /*placeholder*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const placeholder_1_changes = {};
    			if (dirty & /*placeholder*/ 2) placeholder_1_changes.placeholder = /*placeholder*/ ctx[1];
    			placeholder_1.$set(placeholder_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(10:4) {#if contentDisplay === 'hide'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let load_action;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loaded*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", /*rootClass*/ ctx[5]);
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(load_action = /*load*/ ctx[6].call(null, div));
    				mounted = true;
    			}
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
    				if_block.m(div, null);
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
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
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

    const contentClass = "svelte-lazy-content";

    function getContainerHeight(e) {
    	if (e && e.target && e.target.getBoundingClientRect) {
    		return e.target.getBoundingClientRect().bottom;
    	} else {
    		return window.innerHeight;
    	}
    }

    // From underscore souce code
    function throttle(func, wait, options) {
    	let context, args, result;
    	let timeout = null;
    	let previous = 0;
    	if (!options) options = {};

    	const later = function () {
    		previous = options.leading === false ? 0 : new Date();
    		timeout = null;
    		result = func.apply(context, args);
    		if (!timeout) context = args = null;
    	};

    	return function (event) {
    		const now = new Date();
    		if (!previous && options.leading === false) previous = now;
    		const remaining = wait - (now - previous);
    		context = this;
    		args = arguments;

    		if (remaining <= 0 || remaining > wait) {
    			if (timeout) {
    				clearTimeout(timeout);
    				timeout = null;
    			}

    			previous = now;
    			result = func.apply(context, args);
    			if (!timeout) context = args = null;
    		} else if (!timeout && options.trailing !== false) {
    			timeout = setTimeout(later, remaining);
    		}

    		return result;
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Src", slots, ['default']);
    	let { height = 0 } = $$props;
    	let { offset = 150 } = $$props;
    	let { fadeOption = { delay: 0, duration: 400 } } = $$props;
    	let { resetHeightDelay = 0 } = $$props;
    	let { onload = null } = $$props;
    	let { placeholder = null } = $$props;
    	let { class: className = "" } = $$props;
    	const rootClass = "svelte-lazy" + (className ? " " + className : "");
    	let loaded = false;
    	let contentDisplay = "";

    	function load(node) {
    		setHeight(node);

    		const loadHandler = throttle(
    			e => {
    				const nodeTop = node.getBoundingClientRect().top;
    				const expectedTop = getContainerHeight(e) + offset;

    				if (nodeTop <= expectedTop) {
    					$$invalidate(2, loaded = true);
    					resetHeight(node);
    					onload && onload(node);
    					removeListeners();
    				}
    			},
    			200
    		);

    		loadHandler();
    		addListeners();

    		function addListeners() {
    			document.addEventListener("scroll", loadHandler, true);
    			window.addEventListener("resize", loadHandler);
    		}

    		function removeListeners() {
    			document.removeEventListener("scroll", loadHandler, true);
    			window.removeEventListener("resize", loadHandler);
    		}

    		return {
    			destroy: () => {
    				removeListeners();
    			}
    		};
    	}

    	function setHeight(node) {
    		if (height) {
    			node.style.height = typeof height === "number" ? height + "px" : height;
    		}
    	}

    	function resetHeight(node) {
    		// Add delay for remote resources like images to load
    		setTimeout(
    			() => {
    				const handled = handleImgContent(node);

    				if (!handled) {
    					node.style.height = "auto";
    				}
    			},
    			resetHeightDelay
    		);
    	}

    	function handleImgContent(node) {
    		const img = node.querySelector("img");

    		if (img) {
    			if (!img.complete) {
    				$$invalidate(3, contentDisplay = "hide");

    				node.addEventListener(
    					"load",
    					() => {
    						$$invalidate(3, contentDisplay = "");
    						node.style.height = "auto";
    					},
    					{ capture: true, once: true }
    				);

    				node.addEventListener(
    					"error",
    					() => {
    						// Keep passed height if there is error
    						$$invalidate(3, contentDisplay = "");
    					},
    					{ capture: true, once: true }
    				);

    				return true;
    			} else if (img.naturalHeight === 0) {
    				// Keep passed height if img has zero height
    				return true;
    			}
    		}
    	}

    	const writable_props = [
    		"height",
    		"offset",
    		"fadeOption",
    		"resetHeightDelay",
    		"onload",
    		"placeholder",
    		"class"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("offset" in $$props) $$invalidate(8, offset = $$props.offset);
    		if ("fadeOption" in $$props) $$invalidate(0, fadeOption = $$props.fadeOption);
    		if ("resetHeightDelay" in $$props) $$invalidate(9, resetHeightDelay = $$props.resetHeightDelay);
    		if ("onload" in $$props) $$invalidate(10, onload = $$props.onload);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("class" in $$props) $$invalidate(11, className = $$props.class);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		Placeholder,
    		height,
    		offset,
    		fadeOption,
    		resetHeightDelay,
    		onload,
    		placeholder,
    		className,
    		rootClass,
    		contentClass,
    		loaded,
    		contentDisplay,
    		load,
    		setHeight,
    		resetHeight,
    		handleImgContent,
    		getContainerHeight,
    		throttle,
    		contentStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("offset" in $$props) $$invalidate(8, offset = $$props.offset);
    		if ("fadeOption" in $$props) $$invalidate(0, fadeOption = $$props.fadeOption);
    		if ("resetHeightDelay" in $$props) $$invalidate(9, resetHeightDelay = $$props.resetHeightDelay);
    		if ("onload" in $$props) $$invalidate(10, onload = $$props.onload);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(11, className = $$props.className);
    		if ("loaded" in $$props) $$invalidate(2, loaded = $$props.loaded);
    		if ("contentDisplay" in $$props) $$invalidate(3, contentDisplay = $$props.contentDisplay);
    		if ("contentStyle" in $$props) $$invalidate(4, contentStyle = $$props.contentStyle);
    	};

    	let contentStyle;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*contentDisplay*/ 8) {
    			 $$invalidate(4, contentStyle = contentDisplay === "hide" ? "display: none" : "");
    		}
    	};

    	return [
    		fadeOption,
    		placeholder,
    		loaded,
    		contentDisplay,
    		contentStyle,
    		rootClass,
    		load,
    		height,
    		offset,
    		resetHeightDelay,
    		onload,
    		className,
    		$$scope,
    		slots
    	];
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			height: 7,
    			offset: 8,
    			fadeOption: 0,
    			resetHeightDelay: 9,
    			onload: 10,
    			placeholder: 1,
    			class: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Src",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get height() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fadeOption() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fadeOption(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resetHeightDelay() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resetHeightDelay(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onload() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onload(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Stay.svelte generated by Svelte v3.28.0 */
    const file$5 = "src\\Stay.svelte";

    // (32:1) <Lazy height={270} fadeOptions={{ delay: 250 }} class="shimmer rounded-largest">
    function create_default_slot(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "w-full rounded-largest img-stay object-center object-cover svelte-jy0gyg");
    			if (img.src !== (img_src_value = /*detail*/ ctx[0].photo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*detail*/ ctx[0].title);
    			add_location(img, file$5, 32, 2, 757);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*detail*/ 1 && img.src !== (img_src_value = /*detail*/ ctx[0].photo)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*detail*/ 1 && img_alt_value !== (img_alt_value = /*detail*/ ctx[0].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(32:1) <Lazy height={270} fadeOptions={{ delay: 250 }} class=\\\"shimmer rounded-largest\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#if detail.superHost}
    function create_if_block$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "super host";
    			attr_dev(span, "class", "badge svelte-jy0gyg");
    			add_location(span, file$5, 41, 5, 1095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:4) {#if detail.superHost}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div4;
    	let lazy;
    	let t0;
    	let a;
    	let div2;
    	let div0;
    	let t1;
    	let span0;
    	let t2_value = /*detail*/ ctx[0].type + "";
    	let t2;
    	let t3;

    	let t4_value = (/*detail*/ ctx[0].beds
    	? ` . ${/*detail*/ ctx[0].beds} beds`
    	: "") + "";

    	let t4;
    	let t5;
    	let div1;
    	let span1;
    	let t7;
    	let span2;
    	let t8_value = /*detail*/ ctx[0].rating + "";
    	let t8;
    	let t9;
    	let div3;
    	let t10_value = /*detail*/ ctx[0].title + "";
    	let t10;
    	let current;

    	lazy = new Src({
    			props: {
    				height: 270,
    				fadeOptions: { delay: 250 },
    				class: "shimmer rounded-largest",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*detail*/ ctx[0].superHost && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			create_component(lazy.$$.fragment);
    			t0 = space();
    			a = element("a");
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "grade";
    			t7 = space();
    			span2 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			div3 = element("div");
    			t10 = text(t10_value);
    			attr_dev(span0, "class", "min-w-0 truncate");
    			add_location(span0, file$5, 43, 4, 1149);
    			attr_dev(div0, "class", "text-gray-500 text-xs truncate py-2");
    			add_location(div0, file$5, 39, 3, 1011);
    			attr_dev(span1, "class", "material-icons text-red-500");
    			add_location(span1, file$5, 48, 4, 1331);
    			attr_dev(span2, "class", "text-sm");
    			add_location(span2, file$5, 49, 4, 1391);
    			attr_dev(div1, "class", "text-gray-700 flex items-center py-2");
    			add_location(div1, file$5, 47, 3, 1275);
    			attr_dev(div2, "class", "flex justify-between items-center select-none");
    			add_location(div2, file$5, 38, 2, 947);
    			attr_dev(div3, "class", "font-semibold min-w-0 truncate text-sm");
    			add_location(div3, file$5, 52, 2, 1460);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "grid grid-cols-1 row-gap-1 mt-3");
    			add_location(a, file$5, 37, 1, 891);
    			attr_dev(div4, "class", "w-full rounded overflow-hidden");
    			add_location(div4, file$5, 30, 0, 626);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			mount_component(lazy, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, a);
    			append_dev(a, div2);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(span0, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t7);
    			append_dev(div1, span2);
    			append_dev(span2, t8);
    			append_dev(a, t9);
    			append_dev(a, div3);
    			append_dev(div3, t10);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const lazy_changes = {};

    			if (dirty & /*$$scope, detail*/ 5) {
    				lazy_changes.$$scope = { dirty, ctx };
    			}

    			lazy.$set(lazy_changes);

    			if (/*detail*/ ctx[0].superHost) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div0, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || dirty & /*detail*/ 1) && t2_value !== (t2_value = /*detail*/ ctx[0].type + "")) set_data_dev(t2, t2_value);

    			if ((!current || dirty & /*detail*/ 1) && t4_value !== (t4_value = (/*detail*/ ctx[0].beds
    			? ` . ${/*detail*/ ctx[0].beds} beds`
    			: "") + "")) set_data_dev(t4, t4_value);

    			if ((!current || dirty & /*detail*/ 1) && t8_value !== (t8_value = /*detail*/ ctx[0].rating + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*detail*/ 1) && t10_value !== (t10_value = /*detail*/ ctx[0].title + "")) set_data_dev(t10, t10_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lazy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lazy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(lazy);
    			if (if_block) if_block.d();
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
    	validate_slots("Stay", slots, []);
    	let dispatch = createEventDispatcher();
    	let { detail } = $$props;
    	const writable_props = ["detail"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("detail" in $$props) $$invalidate(0, detail = $$props.detail);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Lazy: Src,
    		dispatch,
    		detail
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("detail" in $$props) $$invalidate(0, detail = $$props.detail);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [detail];
    }

    class Stay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { detail: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stay",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*detail*/ ctx[0] === undefined && !("detail" in props)) {
    			console.warn("<Stay> was created without expected prop 'detail'");
    		}
    	}

    	get detail() {
    		throw new Error("<Stay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set detail(value) {
    		throw new Error("<Stay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const [send, receive] = crossfade({
    	duration: (d) => Math.sqrt(d * 200),

    	fallback(node, params) {
    		const style = getComputedStyle(node);
    		const transform = style.transform === "none" ? "" : style.transform;

    		return {
    			duration: 600,
    			easing: quintOut,
    			css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
    		};
    	},
    });

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src\Stays.svelte generated by Svelte v3.28.0 */
    const file$6 = "src\\Stays.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (26:2) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Stays couldn't be found.";
    			attr_dev(p, "class", "text-center w-full");
    			add_location(p, file$6, 26, 3, 719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(26:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:2) {#if stays.length}
    function create_if_block$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*stays*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*stay*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "w-full grid gap-8 grid-cols-1 md:grid-cols-3 sm:grid-cols-2");
    			add_location(div, file$6, 14, 3, 387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stays*/ 1) {
    				const each_value = /*stays*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(14:2) {#if stays.length}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#each stays as stay (stay.id)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let stay;
    	let t;
    	let div_intro;
    	let div_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	stay = new Stay({
    			props: { detail: /*stay*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(stay.$$.fragment);
    			t = space();
    			add_location(div, file$6, 16, 5, 504);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(stay, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const stay_changes = {};
    			if (dirty & /*stays*/ 1) stay_changes.detail = /*stay*/ ctx[1];
    			stay.$set(stay_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 150 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stay.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, receive, { key: /*stay*/ ctx[1].id });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stay.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, send, { key: /*stay*/ ctx[1].id });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(stay);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:4) {#each stays as stay (stay.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t2_value = /*stays*/ ctx[0].length + "";
    	let t2;
    	let t3;
    	let t4;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*stays*/ ctx[0].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Stays in Finland";
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = text(" Stays");
    			t4 = space();
    			if_block.c();
    			attr_dev(h1, "class", "text-2xl font-bold");
    			add_location(h1, file$6, 10, 2, 267);
    			add_location(p, file$6, 11, 2, 323);
    			attr_dev(div0, "class", "flex justify-between items-center pb-6");
    			add_location(div0, file$6, 9, 1, 211);
    			attr_dev(div1, "class", "p-5 md:px-20");
    			add_location(div1, file$6, 8, 0, 182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*stays*/ 1) && t2_value !== (t2_value = /*stays*/ ctx[0].length + "")) set_data_dev(t2, t2_value);
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
    				if_block.m(div1, null);
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
    			if_blocks[current_block_type_index].d();
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
    	validate_slots("Stays", slots, []);
    	let { stays = {} } = $$props;
    	const writable_props = ["stays"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stays> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("stays" in $$props) $$invalidate(0, stays = $$props.stays);
    	};

    	$$self.$capture_state = () => ({ Stay, send, receive, flip, stays });

    	$$self.$inject_state = $$props => {
    		if ("stays" in $$props) $$invalidate(0, stays = $$props.stays);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stays];
    }

    class Stays extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { stays: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stays",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get stays() {
    		throw new Error("<Stays>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stays(value) {
    		throw new Error("<Stays>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SearchNav.svelte generated by Svelte v3.28.0 */
    const file$7 = "src\\SearchNav.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (121:0) {#if visible}
    function create_if_block$4(ctx) {
    	let div17;
    	let div16;
    	let div0;
    	let t0;
    	let i;
    	let t2;
    	let div4;
    	let div1;
    	let input0;
    	let input0_value_value;
    	let t3;
    	let span0;
    	let t5;
    	let t6;
    	let div2;
    	let input1;
    	let t7;
    	let span1;
    	let t9;
    	let t10;
    	let div3;
    	let button0;
    	let span2;
    	let t12;
    	let span3;
    	let t14;
    	let div14;
    	let div5;
    	let t15;
    	let div13;
    	let div12;
    	let div8;
    	let h10;
    	let t17;
    	let p0;
    	let t19;
    	let div7;
    	let button1;
    	let span4;
    	let t21;
    	let div6;
    	let t22;
    	let button2;
    	let span5;
    	let t24;
    	let div11;
    	let h11;
    	let t26;
    	let p1;
    	let t28;
    	let div10;
    	let button3;
    	let span6;
    	let t30;
    	let div9;
    	let t31;
    	let button4;
    	let span7;
    	let t33;
    	let div15;
    	let button5;
    	let span8;
    	let t35;
    	let span9;
    	let t37;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*location*/ ctx[2].city && /*location*/ ctx[2].country && create_if_block_3(ctx);
    	let if_block1 = /*guest*/ ctx[3] && create_if_block_2(ctx);
    	let each_value = /*locationList*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block2 = /*overlay*/ ctx[6] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div17 = element("div");
    			div16 = element("div");
    			div0 = element("div");
    			t0 = text("Edit your search\r\n        ");
    			i = element("i");
    			i.textContent = "close";
    			t2 = space();
    			div4 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = "Location";
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t7 = space();
    			span1 = element("span");
    			span1.textContent = "Guest";
    			t9 = space();
    			if (if_block1) if_block1.c();
    			t10 = space();
    			div3 = element("div");
    			button0 = element("button");
    			span2 = element("span");
    			span2.textContent = "search";
    			t12 = space();
    			span3 = element("span");
    			span3.textContent = "Search";
    			t14 = space();
    			div14 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div8 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Adults";
    			t17 = space();
    			p0 = element("p");
    			p0.textContent = "Ages 13 or older";
    			t19 = space();
    			div7 = element("div");
    			button1 = element("button");
    			span4 = element("span");
    			span4.textContent = "remove";
    			t21 = space();
    			div6 = element("div");
    			t22 = space();
    			button2 = element("button");
    			span5 = element("span");
    			span5.textContent = "add";
    			t24 = space();
    			div11 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Children";
    			t26 = space();
    			p1 = element("p");
    			p1.textContent = "Ages 2-12";
    			t28 = space();
    			div10 = element("div");
    			button3 = element("button");
    			span6 = element("span");
    			span6.textContent = "remove";
    			t30 = space();
    			div9 = element("div");
    			t31 = space();
    			button4 = element("button");
    			span7 = element("span");
    			span7.textContent = "add";
    			t33 = space();
    			div15 = element("div");
    			button5 = element("button");
    			span8 = element("span");
    			span8.textContent = "search";
    			t35 = space();
    			span9 = element("span");
    			span9.textContent = "Search";
    			t37 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(i, "class", "material-icons cursor-pointer");
    			add_location(i, file$7, 125, 8, 2439);
    			attr_dev(div0, "class", "md:hidden block mb-5 text-sm flex justify-between items-center");
    			add_location(div0, file$7, 123, 6, 2327);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-input rounded-large svelte-74pkir");
    			input0.readOnly = true;
    			attr_dev(input0, "placeholder", "Add location");

    			input0.value = input0_value_value = /*location*/ ctx[2].city
    			? `${/*location*/ ctx[2].city}, ${/*location*/ ctx[2].country}`
    			: "";

    			toggle_class(input0, "focus", /*toggleTab*/ ctx[7] === "location");
    			toggle_class(input0, "filled", /*location*/ ctx[2] !== "");
    			toggle_class(input0, "empty", /*location*/ ctx[2] === "");
    			add_location(input0, file$7, 129, 10, 2719);
    			attr_dev(span0, "class", "input-label text-smallest svelte-74pkir");
    			add_location(span0, file$7, 139, 10, 3149);
    			attr_dev(div1, "class", "relative w-full h-12 md:h-auto");
    			add_location(div1, file$7, 128, 8, 2663);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "empty form-input rounded-large svelte-74pkir");
    			input1.readOnly = true;
    			attr_dev(input1, "placeholder", "Add guest");
    			input1.value = /*guest*/ ctx[3];
    			toggle_class(input1, "focus", /*toggleTab*/ ctx[7] === "guest");
    			toggle_class(input1, "filled", /*guest*/ ctx[3] !== "");
    			toggle_class(input1, "empty", /*guest*/ ctx[3] === "");
    			add_location(input1, file$7, 145, 10, 3499);
    			attr_dev(span1, "class", "input-label text-smallest svelte-74pkir");
    			add_location(span1, file$7, 155, 10, 3865);
    			attr_dev(div2, "class", "relative w-full h-12 md:h-auto");
    			add_location(div2, file$7, 144, 8, 3443);
    			attr_dev(span2, "class", "material-icons align-middle mr-1");
    			add_location(span2, file$7, 165, 12, 4364);
    			attr_dev(span3, "class", "align-middle");
    			add_location(span3, file$7, 166, 12, 4438);
    			attr_dev(button0, "class", "bg-red-500 hover:bg-red-700 text-white text-sm font-medium\r\n            py-2 px-4 rounded-large");
    			add_location(button0, file$7, 161, 10, 4188);
    			attr_dev(div3, "class", "py-1 px-6 text-center md:block hidden");
    			add_location(div3, file$7, 160, 8, 4125);
    			attr_dev(div4, "class", "grid md:grid-cols-3 grid-cols-1 rounded-large shadow divide-y md:divide-y-0 md:divide-x divide-gray-300");
    			add_location(div4, file$7, 127, 6, 2536);
    			attr_dev(div5, "class", "md:pt-10 pt-5 px-1 transition duration-200 w-full svelte-74pkir");
    			toggle_class(div5, "hidelist", /*toggleTab*/ ctx[7] !== "location");
    			toggle_class(div5, "showlist", /*toggleTab*/ ctx[7] === "location");
    			add_location(div5, file$7, 171, 8, 4601);
    			attr_dev(h10, "class", "font-bold text-sm");
    			add_location(h10, file$7, 194, 14, 5528);
    			attr_dev(p0, "class", "text-sm");
    			set_style(p0, "color", "rgb(189, 189, 189)");
    			add_location(p0, file$7, 195, 14, 5585);
    			attr_dev(span4, "class", "material-icons align-middle");
    			set_style(span4, "font-size", "12px");
    			add_location(span4, file$7, 203, 18, 5967);
    			attr_dev(button1, "class", "border border-black rounded bg-white text-black w-5 h-5\r\n                  leading-4 active:bg-gray-400");
    			add_location(button1, file$7, 199, 16, 5763);
    			attr_dev(div6, "class", "w-12 h-5 leading-5 text-center text-xs font-bold");
    			attr_dev(div6, "contenteditable", "true");
    			attr_dev(div6, "onkeydown", "if(event.metaKey) return true; return false;");
    			if (/*adults*/ ctx[4] === void 0) add_render_callback(() => /*div6_input_handler*/ ctx[16].call(div6));
    			add_location(div6, file$7, 209, 16, 6174);
    			attr_dev(span5, "class", "material-icons align-middle");
    			set_style(span5, "font-size", "12px");
    			add_location(span5, file$7, 218, 18, 6640);
    			attr_dev(button2, "class", "border border-black rounded bg-white text-black w-5 h-5\r\n                  leading-4 active:bg-gray-400");
    			add_location(button2, file$7, 214, 16, 6436);
    			attr_dev(div7, "class", "flex items-center mt-2");
    			add_location(div7, file$7, 198, 14, 5709);
    			add_location(div8, file$7, 193, 12, 5507);
    			attr_dev(h11, "class", "font-bold text-sm");
    			add_location(h11, file$7, 227, 14, 6917);
    			attr_dev(p1, "class", "text-sm");
    			set_style(p1, "color", "rgb(189, 189, 189)");
    			add_location(p1, file$7, 228, 14, 6976);
    			attr_dev(span6, "class", "material-icons align-middle");
    			set_style(span6, "font-size", "12px");
    			add_location(span6, file$7, 236, 18, 7353);
    			attr_dev(button3, "class", "border border-black rounded bg-white text-black w-5 h-5\r\n                  leading-4 active:bg-gray-400");
    			add_location(button3, file$7, 232, 16, 7147);
    			attr_dev(div9, "class", "w-12 h-5 leading-5 text-center text-xs font-bold");
    			attr_dev(div9, "contenteditable", "true");
    			attr_dev(div9, "onkeydown", "if(event.metaKey) return true; return false;");
    			if (/*children*/ ctx[5] === void 0) add_render_callback(() => /*div9_input_handler*/ ctx[19].call(div9));
    			add_location(div9, file$7, 242, 16, 7560);
    			attr_dev(span7, "class", "material-icons align-middle");
    			set_style(span7, "font-size", "12px");
    			add_location(span7, file$7, 251, 18, 8030);
    			attr_dev(button4, "class", "border border-black rounded bg-white text-black w-5 h-5\r\n                  leading-4 active:bg-gray-400");
    			add_location(button4, file$7, 247, 16, 7824);
    			attr_dev(div10, "class", "flex items-center mt-2");
    			add_location(div10, file$7, 231, 14, 7093);
    			attr_dev(div11, "class", "mt-10");
    			add_location(div11, file$7, 226, 12, 6882);
    			attr_dev(div12, "class", "flex flex-col p-4");
    			add_location(div12, file$7, 192, 10, 5462);
    			attr_dev(div13, "class", "md:pt-10 pt-3 px-1 transition duration-500 md:static absolute w-full svelte-74pkir");
    			toggle_class(div13, "hidelist", /*toggleTab*/ ctx[7] !== "guest");
    			toggle_class(div13, "showlist", /*toggleTab*/ ctx[7] === "guest");
    			add_location(div13, file$7, 188, 8, 5257);
    			attr_dev(div14, "class", "grid md:grid-cols-3 grid-cols-1 relative");
    			add_location(div14, file$7, 170, 6, 4537);
    			attr_dev(span8, "class", "material-icons align-middle mr-1");
    			add_location(span8, file$7, 267, 12, 8546);
    			attr_dev(span9, "class", "align-middle");
    			add_location(span9, file$7, 268, 12, 8620);
    			attr_dev(button5, "class", "bg-red-500 hover:bg-red-700 text-white text-sm font-medium\r\n            py-2 px-4 rounded-large");
    			add_location(button5, file$7, 263, 7, 8370);
    			attr_dev(div15, "class", "md:hidden block mt-16 text-center");
    			add_location(div15, file$7, 262, 6, 8314);
    			attr_dev(div16, "class", "bg-white p-5 md:px-20 md:py-16");
    			add_location(div16, file$7, 122, 4, 2275);
    			attr_dev(div17, "class", "fixed top-0 left-0 w-full h-screen");
    			add_location(div17, file$7, 121, 2, 2221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div16);
    			append_dev(div16, div0);
    			append_dev(div0, t0);
    			append_dev(div0, i);
    			append_dev(div16, t2);
    			append_dev(div16, div4);
    			append_dev(div4, div1);
    			append_dev(div1, input0);
    			append_dev(div1, t3);
    			append_dev(div1, span0);
    			append_dev(div1, t5);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div4, t6);
    			append_dev(div4, div2);
    			append_dev(div2, input1);
    			append_dev(div2, t7);
    			append_dev(div2, span1);
    			append_dev(div2, t9);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(button0, span2);
    			append_dev(button0, t12);
    			append_dev(button0, span3);
    			append_dev(div16, t14);
    			append_dev(div16, div14);
    			append_dev(div14, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			append_dev(div14, t15);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div8);
    			append_dev(div8, h10);
    			append_dev(div8, t17);
    			append_dev(div8, p0);
    			append_dev(div8, t19);
    			append_dev(div8, div7);
    			append_dev(div7, button1);
    			append_dev(button1, span4);
    			append_dev(div7, t21);
    			append_dev(div7, div6);

    			if (/*adults*/ ctx[4] !== void 0) {
    				div6.innerHTML = /*adults*/ ctx[4];
    			}

    			append_dev(div7, t22);
    			append_dev(div7, button2);
    			append_dev(button2, span5);
    			append_dev(div12, t24);
    			append_dev(div12, div11);
    			append_dev(div11, h11);
    			append_dev(div11, t26);
    			append_dev(div11, p1);
    			append_dev(div11, t28);
    			append_dev(div11, div10);
    			append_dev(div10, button3);
    			append_dev(button3, span6);
    			append_dev(div10, t30);
    			append_dev(div10, div9);

    			if (/*children*/ ctx[5] !== void 0) {
    				div9.innerHTML = /*children*/ ctx[5];
    			}

    			append_dev(div10, t31);
    			append_dev(div10, button4);
    			append_dev(button4, span7);
    			append_dev(div16, t33);
    			append_dev(div16, div15);
    			append_dev(div15, button5);
    			append_dev(button5, span8);
    			append_dev(button5, t35);
    			append_dev(button5, span9);
    			append_dev(div17, t37);
    			if (if_block2) if_block2.m(div17, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(i, "click", /*toggleVisible*/ ctx[8], false, false, false),
    					listen_dev(input0, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(input1, "click", /*click_handler_1*/ ctx[13], false, false, false),
    					listen_dev(button0, "click", /*handleSearch*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[15], false, false, false),
    					listen_dev(div6, "input", /*div6_input_handler*/ ctx[16]),
    					listen_dev(button2, "click", /*click_handler_4*/ ctx[17], false, false, false),
    					listen_dev(button3, "click", /*click_handler_5*/ ctx[18], false, false, false),
    					listen_dev(div9, "input", /*div9_input_handler*/ ctx[19]),
    					listen_dev(button4, "click", /*click_handler_6*/ ctx[20], false, false, false),
    					listen_dev(button5, "click", /*handleSearch*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*location*/ 4 && input0_value_value !== (input0_value_value = /*location*/ ctx[2].city
    			? `${/*location*/ ctx[2].city}, ${/*location*/ ctx[2].country}`
    			: "") && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*toggleTab*/ 128) {
    				toggle_class(input0, "focus", /*toggleTab*/ ctx[7] === "location");
    			}

    			if (dirty & /*location*/ 4) {
    				toggle_class(input0, "filled", /*location*/ ctx[2] !== "");
    			}

    			if (dirty & /*location*/ 4) {
    				toggle_class(input0, "empty", /*location*/ ctx[2] === "");
    			}

    			if (/*location*/ ctx[2].city && /*location*/ ctx[2].country) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*guest*/ 8 && input1.value !== /*guest*/ ctx[3]) {
    				prop_dev(input1, "value", /*guest*/ ctx[3]);
    			}

    			if (dirty & /*toggleTab*/ 128) {
    				toggle_class(input1, "focus", /*toggleTab*/ ctx[7] === "guest");
    			}

    			if (dirty & /*guest*/ 8) {
    				toggle_class(input1, "filled", /*guest*/ ctx[3] !== "");
    			}

    			if (dirty & /*guest*/ 8) {
    				toggle_class(input1, "empty", /*guest*/ ctx[3] === "");
    			}

    			if (/*guest*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*location, locationList, toggleTab*/ 134) {
    				each_value = /*locationList*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*toggleTab*/ 128) {
    				toggle_class(div5, "hidelist", /*toggleTab*/ ctx[7] !== "location");
    			}

    			if (dirty & /*toggleTab*/ 128) {
    				toggle_class(div5, "showlist", /*toggleTab*/ ctx[7] === "location");
    			}

    			if (dirty & /*adults*/ 16 && /*adults*/ ctx[4] !== div6.innerHTML) {
    				div6.innerHTML = /*adults*/ ctx[4];
    			}

    			if (dirty & /*children*/ 32 && /*children*/ ctx[5] !== div9.innerHTML) {
    				div9.innerHTML = /*children*/ ctx[5];
    			}

    			if (dirty & /*toggleTab*/ 128) {
    				toggle_class(div13, "hidelist", /*toggleTab*/ ctx[7] !== "guest");
    			}

    			if (dirty & /*toggleTab*/ 128) {
    				toggle_class(div13, "showlist", /*toggleTab*/ ctx[7] === "guest");
    			}

    			if (/*overlay*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*overlay*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div17, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div17);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(121:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (141:10) {#if location.city && location.country}
    function create_if_block_3(ctx) {
    	let span;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			i.textContent = "close";
    			attr_dev(i, "class", "material-icons");
    			set_style(i, "font-size", "12px");
    			add_location(i, file$7, 141, 77, 3334);
    			attr_dev(span, "class", "clear-input text-smallest svelte-74pkir");
    			add_location(span, file$7, 141, 12, 3269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clearLocation*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(141:10) {#if location.city && location.country}",
    		ctx
    	});

    	return block;
    }

    // (157:10) {#if guest}
    function create_if_block_2(ctx) {
    	let span;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			i.textContent = "close";
    			attr_dev(i, "class", "material-icons");
    			set_style(i, "font-size", "12px");
    			add_location(i, file$7, 157, 74, 4016);
    			attr_dev(span, "class", "clear-input text-smallest svelte-74pkir");
    			add_location(span, file$7, 157, 12, 3954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clearGuest*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(157:10) {#if guest}",
    		ctx
    	});

    	return block;
    }

    // (176:10) {#each locationList as loc}
    function create_each_block$1(ctx) {
    	let div;
    	let span;
    	let t1;
    	let t2_value = /*loc*/ ctx[22].city + "";
    	let t2;
    	let t3;
    	let t4_value = /*loc*/ ctx[22].country + "";
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[14](/*loc*/ ctx[22], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "room";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text(", ");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(span, "class", "material-icons mr-2");
    			add_location(span, file$7, 183, 14, 5106);
    			attr_dev(div, "class", "text-gray-800 flex items-center cursor-pointer p-4\r\n              hover:bg-gray-400 text-xs font-medium");
    			add_location(div, file$7, 176, 12, 4834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*locationList*/ 2 && t2_value !== (t2_value = /*loc*/ ctx[22].city + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*locationList*/ 2 && t4_value !== (t4_value = /*loc*/ ctx[22].country + "")) set_data_dev(t4, t4_value);
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
    		source: "(176:10) {#each locationList as loc}",
    		ctx
    	});

    	return block;
    }

    // (273:4) {#if overlay}
    function create_if_block_1$2(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "absolute w-full h-screen opacity-25 bg-black");
    			add_location(div, file$7, 273, 6, 8734);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleVisible*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(273:4) {#if overlay}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$4(ctx);

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
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (if_block) if_block.d(detaching);
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
    	validate_slots("SearchNav", slots, []);
    	let dispatch = createEventDispatcher();
    	let { visible = false } = $$props;
    	let { locationList = [] } = $$props;
    	let location = { city: "", country: "" };
    	let guest = "";
    	let adults = 0;
    	let children = 0;
    	let overlay = false;
    	let toggleTab = "location";

    	function toggleVisible() {
    		$$invalidate(0, visible = !visible);
    		$$invalidate(7, toggleTab = "location");
    		dispatch("close", visible);
    	}

    	function handleSearch() {
    		$$invalidate(0, visible = false);
    		$$invalidate(7, toggleTab = "location");
    		dispatch("search", { location, guest });
    	}

    	function clearLocation() {
    		$$invalidate(2, location.city = $$invalidate(2, location.country = "", location), location);
    	}

    	function clearGuest() {
    		$$invalidate(4, adults = $$invalidate(5, children = 0));
    	}

    	const writable_props = ["visible", "locationList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchNav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(7, toggleTab = "location");
    	const click_handler_1 = () => $$invalidate(7, toggleTab = "guest");

    	const click_handler_2 = loc => {
    		$$invalidate(2, location = { ...loc });
    		$$invalidate(7, toggleTab = "");
    	};

    	const click_handler_3 = () => $$invalidate(4, adults--, adults);

    	function div6_input_handler() {
    		adults = this.innerHTML;
    		(($$invalidate(4, adults), $$invalidate(0, visible)), $$invalidate(5, children));
    	}

    	const click_handler_4 = () => $$invalidate(4, adults++, adults);
    	const click_handler_5 = () => $$invalidate(5, children--, children);

    	function div9_input_handler() {
    		children = this.innerHTML;
    		(($$invalidate(5, children), $$invalidate(0, visible)), $$invalidate(4, adults));
    	}

    	const click_handler_6 = () => $$invalidate(5, children++, children);

    	$$self.$$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("locationList" in $$props) $$invalidate(1, locationList = $$props.locationList);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		dispatch,
    		visible,
    		locationList,
    		location,
    		guest,
    		adults,
    		children,
    		overlay,
    		toggleTab,
    		toggleVisible,
    		handleSearch,
    		clearLocation,
    		clearGuest
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("locationList" in $$props) $$invalidate(1, locationList = $$props.locationList);
    		if ("location" in $$props) $$invalidate(2, location = $$props.location);
    		if ("guest" in $$props) $$invalidate(3, guest = $$props.guest);
    		if ("adults" in $$props) $$invalidate(4, adults = $$props.adults);
    		if ("children" in $$props) $$invalidate(5, children = $$props.children);
    		if ("overlay" in $$props) $$invalidate(6, overlay = $$props.overlay);
    		if ("toggleTab" in $$props) $$invalidate(7, toggleTab = $$props.toggleTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*visible, adults, children*/ 49) {
    			 {
    				$$invalidate(6, overlay = visible);
    				if (adults <= 0) $$invalidate(4, adults = 0);
    				if (children <= 0) $$invalidate(5, children = 0);
    				$$invalidate(3, guest = adults + children);
    			}
    		}
    	};

    	return [
    		visible,
    		locationList,
    		location,
    		guest,
    		adults,
    		children,
    		overlay,
    		toggleTab,
    		toggleVisible,
    		handleSearch,
    		clearLocation,
    		clearGuest,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		div6_input_handler,
    		click_handler_4,
    		click_handler_5,
    		div9_input_handler,
    		click_handler_6
    	];
    }

    class SearchNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { visible: 0, locationList: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchNav",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get visible() {
    		throw new Error("<SearchNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<SearchNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get locationList() {
    		throw new Error("<SearchNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locationList(value) {
    		throw new Error("<SearchNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var stays = [
    	{
    		city: "Helsinki",
    		country: "Finland",
    		superHost: false,
    		title: "Stylist apartment in center of the city",
    		rating: 4.4,
    		maxGuests: 3,
    		type: "Entire apartment",
    		beds: 2,
    		photo:
    			"https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Turku",
    		country: "Finland",
    		superHost: false,
    		title: "Nice apartment in center of Helsinki",
    		rating: 4.2,
    		maxGuests: 5,
    		type: "Entire apartment",
    		beds: 3,
    		photo:
    			"https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Helsinki",
    		country: "Finland",
    		superHost: true,
    		title: "Arty interior in 1900 wooden house",
    		rating: 4.5,
    		maxGuests: 10,
    		type: "Entire house",
    		beds: 6,
    		photo:
    			"https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Helsinki",
    		country: "Finland",
    		superHost: false,
    		title: "Apartment next to market spuare",
    		rating: 4.48,
    		maxGuests: 3,
    		type: "Entire apartment",
    		beds: null,
    		photo:
    			"https://images.unsplash.com/photo-1556020685-ae41abfc9365?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Turku",
    		country: "Finland",
    		superHost: true,
    		title: "Villa Aurora guest-house",
    		rating: 4.75,
    		maxGuests: 9,
    		type: "Entire house",
    		beds: null,
    		photo:
    			"https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Vaasa",
    		country: "Finland",
    		superHost: true,
    		title: "A cosy family house",
    		rating: 4.95,
    		maxGuests: 6,
    		type: "Entire house",
    		beds: null,
    		photo:
    			"https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Vaasa",
    		country: "Finland",
    		superHost: false,
    		title: "Lovely Studio near Railway Station",
    		rating: 4.68,
    		maxGuests: 2,
    		type: "Private room",
    		beds: null,
    		photo:
    			"https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Oulu",
    		country: "Finland",
    		superHost: false,
    		title: "Peaceful little home in city center",
    		rating: 4.12,
    		maxGuests: 6,
    		type: "Entire house",
    		beds: 3,
    		photo:
    			"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Oulu",
    		country: "Finland",
    		superHost: false,
    		title: "Beautiful new studio apartment nearby the center",
    		rating: 4.49,
    		maxGuests: 2,
    		type: "Entire apartment",
    		beds: 1,
    		photo:
    			"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Oulu",
    		country: "Finland",
    		superHost: true,
    		title: "Cozy woodhouse flat with wooden sauna",
    		rating: 4.38,
    		maxGuests: 4,
    		type: "Entire house",
    		beds: null,
    		photo:
    			"https://images.unsplash.com/photo-1522156373667-4c7234bbd804?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjF9&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Vaasa",
    		country: "Finland",
    		superHost: false,
    		title: "Brand new studio apartment near the harbour",
    		rating: 4.89,
    		maxGuests: 6,
    		type: "Entire apartment",
    		beds: 3,
    		photo:
    			"https://images.unsplash.com/photo-1494203484021-3c454daf695d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Helsinki",
    		country: "Finland",
    		superHost: false,
    		title: "Beautiful and comfortable old wooden house",
    		rating: 4.63,
    		maxGuests: 10,
    		type: "Entire house",
    		beds: null,
    		photo:
    			"https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Turku",
    		country: "Finland",
    		superHost: false,
    		title: "Turku Nordic Home near city center",
    		rating: 4.24,
    		maxGuests: 5,
    		type: "Entire apartment",
    		beds: 3,
    		photo:
    			"https://images.unsplash.com/photo-1519643381401-22c77e60520e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjE3MzYxfQ&auto=format&fit=crop&w=500",
    	},
    	{
    		city: "Turku",
    		country: "Finland",
    		superHost: true,
    		title: "Nice 2 room apartment close to everything",
    		rating: 4.34,
    		maxGuests: 6,
    		type: "Entire apartment",
    		beds: 3,
    		photo:
    			"https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500",
    	},
    ];

    const uniqId = () => {
    	return '_' + Math.random().toString(36).substr(2, 9);
    };

    /* src\App.svelte generated by Svelte v3.28.0 */

    const { Object: Object_1, console: console_1 } = globals;

    function create_fragment$9(ctx) {
    	let navbar;
    	let t0;
    	let stays_1;
    	let t1;
    	let searchnav;
    	let t2;
    	let footer;
    	let current;

    	navbar = new Navbar({
    			props: { filter: /*filter*/ ctx[1] },
    			$$inline: true
    		});

    	navbar.$on("search", /*toggleSearchNav*/ ctx[5]);

    	stays_1 = new Stays({
    			props: { stays: /*staysCopy*/ ctx[2] },
    			$$inline: true
    		});

    	searchnav = new SearchNav({
    			props: {
    				visible: /*nav*/ ctx[0],
    				locationList: /*locationList*/ ctx[3]
    			},
    			$$inline: true
    		});

    	searchnav.$on("close", /*closeSearchNav*/ ctx[6]);
    	searchnav.$on("search", /*handleSearch*/ ctx[4]);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(stays_1.$$.fragment);
    			t1 = space();
    			create_component(searchnav.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(stays_1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(searchnav, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};
    			if (dirty & /*filter*/ 2) navbar_changes.filter = /*filter*/ ctx[1];
    			navbar.$set(navbar_changes);
    			const stays_1_changes = {};
    			if (dirty & /*staysCopy*/ 4) stays_1_changes.stays = /*staysCopy*/ ctx[2];
    			stays_1.$set(stays_1_changes);
    			const searchnav_changes = {};
    			if (dirty & /*nav*/ 1) searchnav_changes.visible = /*nav*/ ctx[0];
    			searchnav.$set(searchnav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(stays_1.$$.fragment, local);
    			transition_in(searchnav.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(stays_1.$$.fragment, local);
    			transition_out(searchnav.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(stays_1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(searchnav, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
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
    	validate_slots("App", slots, []);
    	let nav = false;
    	let filter = {};
    	let staysCopy = stays.map(obj => Object.assign(obj, { id: uniqId() }));
    	let locationList = staysCopy.filter((item, i, self) => self.map(itm => itm.city).indexOf(item.city) === i);

    	function handleSearch(e) {
    		let fil = e.detail;
    		$$invalidate(1, filter = { ...fil });

    		$$invalidate(2, staysCopy = stays.filter(stay => {
    			return fil.location.city && fil.location.country
    			? stay.city == fil.location.city && stay.country == fil.location.country && stay.maxGuests >= fil.guest
    			: true;
    		}));
    	}

    	function toggleSearchNav() {
    		$$invalidate(0, nav = !nav);
    	}

    	function closeSearchNav(e) {
    		$$invalidate(0, nav = e.detail);
    	}

    	console.log(stays);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Tailwindcss,
    		Navbar,
    		Footer,
    		Stays,
    		SearchNav,
    		stays,
    		uniqId,
    		nav,
    		filter,
    		staysCopy,
    		locationList,
    		handleSearch,
    		toggleSearchNav,
    		closeSearchNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("nav" in $$props) $$invalidate(0, nav = $$props.nav);
    		if ("filter" in $$props) $$invalidate(1, filter = $$props.filter);
    		if ("staysCopy" in $$props) $$invalidate(2, staysCopy = $$props.staysCopy);
    		if ("locationList" in $$props) $$invalidate(3, locationList = $$props.locationList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nav,
    		filter,
    		staysCopy,
    		locationList,
    		handleSearch,
    		toggleSearchNav,
    		closeSearchNav
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
