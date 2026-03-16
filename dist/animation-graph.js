/**
 * Declarative Animation Graph
 * DAG-based timeline composition: sequence, parallel, stagger, and timeline nodes.
 */
let nodeIdCounter = 0;
function buildNode(config, timelineEngine) {
    const id = ++nodeIdCounter;
    const children = (config.children ?? []).map(c => buildNode(c, timelineEngine));
    let timeline = null;
    if (config.type === 'timeline' && config.timeline) {
        timeline = timelineEngine.create({
            ...config.timeline,
            onFrame: config.onFrame ?? config.timeline.onFrame,
        });
        // Start paused — graph controls playback
        timeline.pause();
    }
    return {
        id,
        type: config.type,
        config,
        children,
        timeline,
        state: 'idle',
        progress: 0,
        finishCallbacks: [],
    };
}
function playNode(node) {
    if (node.state === 'finished')
        return;
    node.state = 'running';
    switch (node.type) {
        case 'timeline':
            if (node.timeline) {
                node.timeline.play();
            }
            break;
        case 'sequence':
            if (node.children.length > 0) {
                playNode(node.children[0]);
            }
            else {
                finishNode(node);
            }
            break;
        case 'parallel':
            if (node.children.length === 0) {
                finishNode(node);
            }
            else {
                for (const child of node.children) {
                    playNode(child);
                }
            }
            break;
        case 'stagger': {
            const delay = node.config.staggerDelay ?? 100;
            node.children.forEach((child, i) => {
                globalThis.setTimeout(() => {
                    if (node.state === 'running') {
                        playNode(child);
                    }
                }, delay * i);
            });
            if (node.children.length === 0) {
                finishNode(node);
            }
            break;
        }
    }
}
function pauseNode(node) {
    if (node.state !== 'running')
        return;
    node.state = 'paused';
    if (node.timeline) {
        node.timeline.pause();
    }
    for (const child of node.children) {
        pauseNode(child);
    }
}
function cancelNode(node) {
    node.state = 'finished';
    if (node.timeline) {
        node.timeline.cancel();
    }
    for (const child of node.children) {
        cancelNode(child);
    }
}
function finishNode(node) {
    node.state = 'finished';
    node.progress = 1;
    for (const cb of node.finishCallbacks) {
        cb();
    }
}
function updateNodeProgress(node) {
    switch (node.type) {
        case 'timeline':
            if (node.timeline) {
                node.progress = node.timeline.progress;
                if (node.timeline.state === 'finished') {
                    finishNode(node);
                }
            }
            break;
        case 'sequence': {
            if (node.children.length === 0)
                break;
            let completedCount = 0;
            let currentChildProgress = 0;
            for (const child of node.children) {
                updateNodeProgress(child);
                if (child.state === 'finished') {
                    completedCount++;
                }
                else {
                    currentChildProgress = child.progress;
                    break;
                }
            }
            node.progress = (completedCount + currentChildProgress) / node.children.length;
            // Start next child in sequence when current finishes
            if (completedCount > 0 && completedCount < node.children.length) {
                const nextChild = node.children[completedCount];
                if (nextChild.state === 'idle') {
                    playNode(nextChild);
                }
            }
            if (completedCount === node.children.length) {
                finishNode(node);
            }
            break;
        }
        case 'parallel':
        case 'stagger': {
            if (node.children.length === 0)
                break;
            let totalProgress = 0;
            let allDone = true;
            for (const child of node.children) {
                updateNodeProgress(child);
                totalProgress += child.progress;
                if (child.state !== 'finished') {
                    allDone = false;
                }
            }
            node.progress = totalProgress / node.children.length;
            if (allDone) {
                finishNode(node);
            }
            break;
        }
    }
}
export function createAnimationGraph(timelineEngine) {
    const graphs = new Map();
    return {
        build(root) {
            const rootNode = buildNode(root, timelineEngine);
            graphs.set(rootNode.id, rootNode);
            return {
                get id() { return rootNode.id; },
                get state() { return rootNode.state; },
                get progress() { return rootNode.progress; },
                play() { playNode(rootNode); },
                pause() { pauseNode(rootNode); },
                cancel() {
                    cancelNode(rootNode);
                    graphs.delete(rootNode.id);
                },
                onFinish(callback) {
                    rootNode.finishCallbacks.push(callback);
                },
            };
        },
        tick(_timestamp) {
            for (const node of graphs.values()) {
                if (node.state === 'running') {
                    updateNodeProgress(node);
                }
            }
            // Clean up finished graphs
            for (const [id, node] of graphs) {
                if (node.state === 'finished') {
                    graphs.delete(id);
                }
            }
        },
        destroy() {
            for (const node of graphs.values()) {
                cancelNode(node);
            }
            graphs.clear();
        },
    };
}
//# sourceMappingURL=animation-graph.js.map