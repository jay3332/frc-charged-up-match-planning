import {
  Accessor,
  Component,
  createMemo,
  createSignal,
  ParentProps,
  Show,
} from "solid-js";
import './root.css'
import {
  DragDropProvider,
  DragDropSensors,
  useDragDropContext,
  createDraggable,
  createDroppable,
} from "@thisbeyond/solid-dnd";

function Label({ children }: ParentProps) {
  return (
    <div class="flex items-center justify-center w-8 h-60 rounded-lg bg-gray-300">
      {children}
    </div>
  )
}

type Mapping = {[key: string]: {type: 'Cone' | 'Cube', isAuto: boolean, linkStart: boolean} | null}
type MappingSignalObj = {mapping: Accessor<Mapping>, setMapping: (mapping: Mapping | ((prev: Mapping) => Mapping)) => void}

function Node(
  { accept, children, nodeId, team, mapping, setMapping }: ParentProps<{ accept: ['Cone'] | ['Cube'] | ['Cone', 'Cube'], nodeId: string, team: 'red' | 'blue' } & MappingSignalObj>,
) {
  const droppable = createDroppable(nodeId, { accept });
  const [state] = useDragDropContext()!

  const active = () => droppable.isActiveDroppable && accept.includes(state.active.draggable?.data.type as never)
  const unallowed = () => state.active.draggable && !accept.includes(state.active.draggable?.data.type as never)
  return (
    <div
      use:droppable
      id={nodeId}
      classList={{
        "flex flex-col relative group items-center justify-center w-20 h-20 rounded-lg transition box-border": true,
        "bg-red-400": team === 'red' && active(),
        "bg-sky-400": team === 'blue' && active(),
        "bg-red-300": team === 'red' && !active(),
        "bg-sky-300": team === 'blue' && !active(),
        "opacity-50": !!unallowed(),
        "p-4": mapping()[nodeId] != null,
      }}
      style={{"touch-action": "none"}}
      onClick={() => {
        if (mapping()[nodeId] != null) {
          setMapping({ ...mapping(), [nodeId]: null })
        }
      }}
    >
      <Show when={mapping()[nodeId]?.linkStart} keyed={false}>
        <div class="absolute inset-0 border-4 border-emerald-500 rounded-lg z-[1000] h-60 pointer-events-none" />
      </Show>
      <div class="flex flex-col items-center justify-center mobile:-rotate-90">
        <Show when={mapping()[nodeId]} keyed={false} fallback={
          <>
            {children}
            <p classList={{
              "font-bold text-xs pt-1": true,
              "text-violet-700": accept.length == 1 && accept[0] == 'Cube',
              "text-yellow-700": accept.length == 1 && accept[0] == 'Cone',
            }}>
              {accept.length < 2 ? `${accept[0]} only` : 'Hybrid'}
            </p>
          </>
        }>
          <div class="absolute inset-0 w-20 h-20 bg-black/60 backdrop-blur rounded-lg cursor-pointer
            opacity-0 group-hover:opacity-100 transition duration-200 text-white flex items-center justify-center text-sm">
            Remove
          </div>
          <div class="flex flex-col items-center justify-center w-full h-full">
            <img src={mapping()[nodeId]?.type === 'Cone' ? './cone.png' : './cube.png'} alt="" class="w-12 h-12" width={80}
                 height={80} draggable={false}/>
            <p class="text-xs font-medium">{mapping()[nodeId]?.isAuto ? 'Autonomous' : 'Tele-op'}</p>
          </div>
        </Show>
      </div>
    </div>
  )
}

function StagingArea({ children, i, team, mapping, setMapping }: ParentProps<{ i: string, team: 'red' | 'blue' } & MappingSignalObj>) {
  const id = 'ipa-' + i
  const droppable = createDroppable(id, { accept: ['Cone', 'Cube'] })

  return (
    <div
      use:droppable
      id={id}
      classList={{
        "flex items-center justify-center relative group w-20 h-20 bg-gray-300 rounded-lg m-8 transition -rotate-90 md:rotate-0": true,
        "bg-red-400": team === 'red' && droppable.isActiveDroppable,
        "bg-sky-400": team === 'blue' && droppable.isActiveDroppable,
        "bg-red-300": team === 'red' && !droppable.isActiveDroppable,
        "bg-sky-300": team === 'blue' && !droppable.isActiveDroppable,
        "p-4": mapping()[id] != null,
      }}
      style={{"touch-action": "none"}}
      onClick={() => {
        if (mapping()[id] != null) {
          setMapping({ ...mapping(), [id]: null })
        }
      }}
    >
      <Show when={mapping()[id]} keyed={false} fallback={children}>
        <div class="absolute inset-0 w-20 h-20 bg-black/60 backdrop-blur rounded-lg cursor-pointer
          opacity-0 group-hover:opacity-100 transition duration-200 text-white flex items-center justify-center text-sm">
          Remove
        </div>
        <div class="flex flex-col items-center justify-center w-full h-full">
          <img src={mapping()[id]?.type === 'Cone' ? './cone.png' : './cube.png'} alt="" class="w-16 h-12" width={80}
               height={80} draggable={false} />
          <p class="text-xs font-medium">{mapping()[id]?.isAuto ? 'Autonomous' : 'Tele-op'}</p>
        </div>
      </Show>
    </div>
  )
}

function DraggableImage(props: { src: string, alt: string }) {
  const draggable = createDraggable(props.alt, { type: props.alt });

  return (
    <div
      use:draggable
      class="flex p-2 md:p-4 bg-gray-400 rounded-lg w-14 h-14 md:w-20 md:h-20 cursor-grab z-[9999]"
      style={{"touch-action": "none"}}
    >
      <img src={props.src} alt={props.alt} class="w-18 h-18" width={80} height={80} draggable={false} />
    </div>
  )
}

function Main() {
  const [, { onDragEnd }] = useDragDropContext()!;

  const $mapping: Mapping = {}
  for (const prefix of ['blue-high-', 'blue-medium-', 'blue-ground-', 'red-ground-', 'red-medium-', 'red-high-']) {
    for (let i = 0; i < 9; i++) {
      $mapping[prefix + i] = null
    }
  }
  for (const prefix of ['ipa-red-', 'ipa-blue-']) {
    for (let i = 0; i < 4; i++) {
      $mapping[prefix + i] = null
    }
  }
  const [mapping, _setMapping] = createSignal<Mapping>({...$mapping})
  const [placingAuto, setPlacingAuto] = createSignal(true)

  onDragEnd(({ draggable, droppable }) => {
    if (droppable && droppable.data?.accept.includes(draggable.id)) {
      setMapping(prev => ({
        ...prev,
        [droppable.id]: {
          type: draggable.id as 'Cone' | 'Cube',
          isAuto: placingAuto(),
          linkStart: false,
        }
      }))
    }
  });

  const [redLinks, setRedLinks] = createSignal(0)
  const [blueLinks, setBlueLinks] = createSignal(0)
  const setMapping = (newMapping: Mapping | ((prev: Mapping) => Mapping)) => {
    const m = typeof newMapping === 'function' ? newMapping(mapping()) : newMapping
    const entries = Object.entries(m)
    let red = 0, blue = 0

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i]
      if (value == null || key.startsWith("ipa")) continue

      const prefix = key.slice(0, -1)
      let index = parseInt(key.slice(-1))

      if (
        (
          m[prefix + (index - 1)] == null
          || (m[prefix + (index - 1)] == null && m[prefix + (index - 2)] == null)
          || m[prefix + (index - 3)]?.linkStart
        )
        && m[prefix + ++index] != null
        && m[prefix + ++index] != null
      ) {
        if (key.startsWith('red')) red++
        if (key.startsWith('blue')) blue++
        m[key] = {...value as any, linkStart: true}
      } else {
        m[key] = {...value as any, linkStart: false}
      }
    }

    setRedLinks(red)
    setBlueLinks(blue)
    _setMapping(m)
  }

  const scores = createMemo(() => {
    const blue = { auto: 0, tele: 0 }
    const red = { auto: 0, tele: 0 }

    for (const [key, value] of Object.entries(mapping())) {
      if (value == null) {
        continue
      }

      const points = value.isAuto ? (
        key.includes('ground') ? 3 : key.includes('medium') ? 4 : key.includes('high') ? 6 : 0
      ) : (
        key.includes('ground') ? 2 : key.includes('medium') ? 3 : key.includes('high') ? 5 : 0
      )
      if (key.startsWith('blue')) {
        value.isAuto ? blue.auto += points : blue.tele += points
      } else {
        value.isAuto ? red.auto += points : red.tele += points
      }
    }
    return { blue, red }
  })

  return (
    <main class="text-center flex flex-col items-center justify-center mx-auto text-gray-700 p-4">
      <h1 class="font-bold text-4xl my-4">Match Planning</h1>
      {/*<img src="/arena.png" alt="Arena" class="w-[90vw] mx-auto my-4"/>*/}
      <div class="flex gap-x-4 mb-4">
        <DraggableImage src="./cone.png" alt="Cone"/>
        <DraggableImage src="./cube.png" alt="Cube"/>
      </div>
      <div class="flex flex-col items-center">
        <div class="flex">
          <button
            class="flex cursor-pointer rounded-lg box-border overflow-hidden"
            onClick={() => setPlacingAuto(old => !old)}
          >
            <span classList={{
              "px-4 py-2": true,
              "bg-blue-500 text-white": placingAuto(),
              "bg-gray-200 text-black": !placingAuto(),
            }}>
              Autonomous
            </span>
            <span classList={{
              "px-4 py-2": true,
              "bg-blue-500 text-white": !placingAuto(),
              "bg-gray-200 text-black": placingAuto(),
            }}>
              Tele-op
            </span>
          </button>
          <button
            class="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 transition rounded-lg ml-2"
            onClick={() => setMapping($mapping)}
          >
            Clear
          </button>
        </div>
        <div class="mt-1">
          <p class="text-blue-600">
            <b>Blue score: </b>{scores().blue.auto} (auto) + {scores().blue.tele} (tele-op) + {blueLinks() * 5} ({blueLinks()} link{blueLinks() !== 1 ? 's' : ''}) = <b>{scores().blue.auto + scores().blue.tele + blueLinks() * 5} points</b>
          </p>
          <p class="text-red-600">
            <b>Red score: </b>{scores().red.auto} (auto) + {scores().red.tele} (tele-op) + {redLinks() * 5} ({redLinks()} link{redLinks() !== 1 ? 's' : ''}) = <b>{scores().red.auto + scores().red.tele + redLinks() * 5} points</b>
          </p>
        </div>
      </div>
      <div class="flex items-center rotate-90 -mt-20 scale-[55%] md:mt-2 md:scale-100 md:rotate-0">
        <div>
          <Label>B1</Label>
          <Label>B2</Label>
          <Label>B3</Label>
        </div>
        {/* lazy */}
        <div>
          {[...new Array(9).keys()].map((i) => (
            <Node accept={[1, 4, 7].includes(i) ? ['Cube'] : ['Cone']} nodeId={`blue-high-${i}`} team='blue' mapping={mapping} setMapping={setMapping}>High</Node>
          ))}
        </div>
        <div>
          {[...new Array(9).keys()].map((i) => (
            <Node accept={[1, 4, 7].includes(i) ? ['Cube'] : ['Cone']} nodeId={`blue-medium-${i}`} team='blue' mapping={mapping} setMapping={setMapping}>Middle</Node>
          ))}
        </div>
        <div>
          {[...new Array(9).keys()].map((i) => (
            <Node accept={['Cone', 'Cube']} nodeId={`blue-ground-${i}`} team='blue' mapping={mapping} setMapping={setMapping}>Ground</Node>
          ))}
        </div>
        <div>
          {[...new Array(4).keys()].map((i) => (
            <StagingArea mapping={mapping} setMapping={setMapping} i={`blue-${i}`} team='blue'>{i + 1}</StagingArea>
          ))}
        </div>
        <div class="h-[600px] w-2 bg-gray-100 rounded-full mx-12" />
        <div>
          {[...new Array(4).keys()].map((i) => (
            <StagingArea mapping={mapping} setMapping={setMapping} i={`red-${i}`} team='red'>{i + 1}</StagingArea>
          ))}
        </div>
        <div>
          {[...new Array(9).keys()].map((i) => (
            <Node accept={['Cone', 'Cube']} nodeId={`red-ground-${i}`} team='red' mapping={mapping} setMapping={setMapping}>Ground</Node>
          ))}
        </div>
        <div>
          {[...new Array(9).keys()].map((i) => (
            <Node accept={[1, 4, 7].includes(i) ? ['Cube'] : ['Cone']} nodeId={`red-medium-${i}`} team='red' mapping={mapping} setMapping={setMapping}>Middle</Node>
          ))}
        </div>
        <div>
          {[...new Array(9).keys()].map((i) => (
            <Node accept={[1, 4, 7].includes(i) ? ['Cube'] : ['Cone']} nodeId={`red-high-${i}`} team='red' mapping={mapping} setMapping={setMapping}>High</Node>
          ))}
        </div>
        <div>
          <Label>R1</Label>
          <Label>R2</Label>
          <Label>R3</Label>
        </div>
      </div>
    </main>
  )
}

const App: Component = () => {
  return (
    <DragDropProvider>
      <DragDropSensors>
        <Main />
      </DragDropSensors>
    </DragDropProvider>
  );
}

export default App
