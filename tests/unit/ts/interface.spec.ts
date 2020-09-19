import * as vue from "vue"
import { buildInterface, ToastInterface } from "../../../src/ts/interface"
import { EVENTS, TYPE } from "../../../src/ts/constants"
import { loadPlugin } from "../../utils/plugin"
import { ToastOptions } from "../../../src/types"
import { EventBus } from "../../../src/ts/eventBus"
import { nextTick } from "vue"

type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: unknown[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T

describe("ToastInterface", () => {
  let wrappers: Unpacked<ReturnType<typeof loadPlugin>>
  let toast: ToastInterface

  const eventBus = new EventBus()

  const eventsEmmited = Object.values(EVENTS).reduce((agg, eventName) => {
    const handler = jest.fn()
    eventBus.on(eventName, handler)
    return { ...agg, [eventName]: handler }
  }, {} as { [eventName in EVENTS]: jest.Mock })

  beforeEach(async () => {
    wrappers = await loadPlugin({ eventBus })
    toast = wrappers.toastInterface
    jest.clearAllMocks()
  })

  it("calls onMounted", async () => {
    const onMounted = jest.fn()
    expect(onMounted).not.toHaveBeenCalled()
    toast = buildInterface({ onMounted })
    await nextTick()
    expect(onMounted).toHaveBeenCalledWith(expect.anything(), expect.anything())
  })

  it("does not call onMounted", () => {
    const onMounted = jest.fn()
    toast = buildInterface()
    expect(onMounted).not.toHaveBeenCalled()
  })

  it("mounts if mountContainer is true", async () => {
    const createAppSpy = jest.spyOn(vue, "createApp")
    expect(createAppSpy).not.toHaveBeenCalled()
    toast = buildInterface({}, true)
    await nextTick()
    expect(createAppSpy).toHaveBeenCalled()
  })

  it("does not mount if mountContainer is false", async () => {
    const createAppSpy = jest.spyOn(vue, "createApp")
    expect(createAppSpy).not.toHaveBeenCalled()
    toast = buildInterface({}, false)
    await nextTick()
    expect(createAppSpy).not.toHaveBeenCalled()
  })

  it("calls regular toast function with defaults", () => {
    expect(eventsEmmited.add).not.toHaveBeenCalled()
    const content = "content"
    const id = toast(content)
    expect(eventsEmmited.add).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.add).toBeCalledWith({
      id: expect.any(Number),
      type: TYPE.DEFAULT,
      content,
    })
    expect(typeof id).toBe("number")
  })
  it("calls regular toast function with extra values", () => {
    expect(eventsEmmited.add).not.toHaveBeenCalled()
    const content = "content"
    const options: ToastOptions = { timeout: 1000 }
    const id = toast(content, options)
    expect(eventsEmmited.add).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.add).toBeCalledWith({
      id: expect.any(Number),
      type: TYPE.DEFAULT,
      content,
      ...options,
    })
    expect(typeof id).toBe("number")
  })
  it("calls clear", () => {
    expect(eventsEmmited.clear).not.toHaveBeenCalled()
    toast.clear()
    expect(eventsEmmited.clear).toHaveBeenCalledTimes(1)
  })
  it("calls updateDefaults", () => {
    expect(eventsEmmited.update_defaults).not.toHaveBeenCalled()
    toast.updateDefaults({ timeout: 1000 })
    expect(eventsEmmited.update_defaults).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.update_defaults).toBeCalledWith({ timeout: 1000 })
  })
  it("calls dismiss", () => {
    expect(eventsEmmited.dismiss).not.toHaveBeenCalled()
    toast.dismiss(10)
    expect(eventsEmmited.dismiss).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.dismiss).toBeCalledWith(10)
  })
  it("calls update with content", () => {
    expect(eventsEmmited.update).not.toHaveBeenCalled()
    const id = 10
    const content = "content"
    toast.update(id, { content })
    expect(eventsEmmited.update).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.update).toBeCalledWith({
      id,
      options: { content },
      create: false,
    })
  })
  it("calls update with options", () => {
    expect(eventsEmmited.update).not.toHaveBeenCalled()
    const id = 10
    const options: ToastOptions = { timeout: 1000 }
    toast.update(id, { options })
    expect(eventsEmmited.update).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.update).toBeCalledWith({
      id,
      options: { ...options, content: undefined },
      create: false,
    })
  })
  it("calls update with create", () => {
    expect(eventsEmmited.update).not.toHaveBeenCalled()
    const id = 10
    const content = "abc"
    toast.update(id, { content }, true)
    expect(eventsEmmited.update).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.update).toBeCalledWith({
      id,
      options: { content },
      create: true,
    })
  })
  it("calls success", () => {
    expect(eventsEmmited.add).not.toHaveBeenCalled()
    const content = "abc"
    toast.success(content)
    expect(eventsEmmited.add).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.add).toBeCalledWith({
      id: expect.any(Number),
      type: TYPE.SUCCESS,
      content,
    })
  })
  it("calls info", () => {
    expect(eventsEmmited.add).not.toHaveBeenCalled()
    const content = "abc"
    toast.info(content)
    expect(eventsEmmited.add).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.add).toBeCalledWith({
      id: expect.any(Number),
      type: TYPE.INFO,
      content,
    })
  })
  it("calls error", () => {
    expect(eventsEmmited.add).not.toHaveBeenCalled()
    const content = "abc"
    toast.error(content)
    expect(eventsEmmited.add).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.add).toBeCalledWith({
      id: expect.any(Number),
      type: TYPE.ERROR,
      content,
    })
  })
  it("calls warning", () => {
    expect(eventsEmmited.add).not.toHaveBeenCalled()
    const content = "abc"
    toast.warning(content)
    expect(eventsEmmited.add).toHaveBeenCalledTimes(1)
    expect(eventsEmmited.add).toBeCalledWith({
      id: expect.any(Number),
      type: TYPE.WARNING,
      content,
    })
  })
})
