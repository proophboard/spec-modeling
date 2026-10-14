---
name: event-modeling
description: Create, extend, and review Event Models on prooph board.
  Covers modeling modes, event-first domain discovery, chapter and slice
  structure, element semantics, causality, and where specification
  content belongs in the visible model and details. Use this skill when
  creating or reviewing an Event Model; use the Local Model skill for
  spec-stream operations and the relevant scenario or wireframe skill
  for executable prototypes and UI wireframes.
---

# Event Modeling on prooph board

Event Modeling visualizes business information flow and domain state
changes. Model real-world behavior before software, use domain language,
make causality visible, and keep unresolved assumptions explicit.

This skill defines the modeling method and the responsibilities of each
part of the prooph board specification. It does not define how to read
or edit the local model, run `spec-stream`, call MCP tools, implement
Exploration Mode scenarios, or build HTML wireframes. Follow the
relevant skill for those activities.

## Modes

Choose the mode that matches the task. Do not mix them.

### Modeling Mode

Use when exploring a domain, creating a model, or extending an existing
model.

-   Ask questions when important domain knowledge is missing.
-   Explore the real-world process before deciding how software supports
    it.
-   Capture the process progressively; do not demand completeness too
    early.
-   Make assumptions visible as Hot Spots or questions rather than
    silently treating them as facts.
-   Validate structural rules as the model develops, but do not let
    early correction interrupt useful discovery.

### Critic Mode

Use when reviewing an existing model for correctness, consistency, and
gaps.

-   Apply the modeling rules and validation checklist strictly.
-   Identify violations, missing information, contradictions, and
    unclear assumptions.
-   Fix violations directly when the correction is unambiguous.
-   Do not invent business rules or choose between plausible business
    interpretations. Explain the issue and ask the human when domain
    knowledge or a business decision is required.
-   Surface unresolved assumptions as questions or Hot Spots.
-   Report material changes and any findings that still need a decision.

## The three layers of a prooph board specification

A model communicates through three complementary layers. Use each for
the kind of information it is designed to carry.

### 1. Visible model: the timeline

The visible model consists of typed, colored sticky notes arranged into
lanes and slices along a timeline.

-   **UI and Automation** describe the user journey and automated
    actors.
-   **Events** describe business process state changes.
-   **Commands and Information** form the communication layer between
    users, other contexts, and the system.
-   A **chapter** is a sub-timeline describing one process or
    subprocess.
-   Each chapter belongs to a context. A context can contain multiple
    chapters, and elements also belong to contexts.

The model should make the process understandable at a glance. Avoid
using the canvas as a place for long prose or detailed technical
specifications.

#### Element descriptions

Descriptions are short, placement-specific content displayed with the
element in the visible model and in Presentation Mode. Use them to
clarify what this occurrence means in the current process step.

-   Prefer concise business language.
-   Avoid technical detail unless it is essential to understand the
    behavior.
-   Include only the properties and values relevant to the current
    example, not an entire schema.
-   A short explanation, example, or diagram can be useful. Mermaid code
    blocks are supported.
-   Do not put a long narrative into a description.

Presentation Mode presents the timeline like slides: - For a UI element,
an HTML code block is rendered as an interactive wireframe. - If no HTML
code block exists but an image does, the image is rendered as a presumed
screenshot. - If neither exists, the UI description is shown as-is. -
For other element types, the description is shown as-is.

Therefore, keep descriptions presentation-friendly. Use the dedicated
HTML wireframe skill for wireframe implementation.

### 2. Details: the specification drawer

Details are shown in the right-hand sidebar. Markdown headings create a
table of contents, so structure longer specifications with meaningful
headings. Attach specification content to the element, lane, or slice it
actually describes.

Use the following ownership rules as a guide:

  -----------------------------------------------------------------------
  Specification content               Attach to
  ----------------------------------- -----------------------------------
  Business rules                      Command

  POST, PUT, PATCH, or DELETE API     Command
  endpoints                           

  State changes, metrics, and         Event
  important outcome descriptions      

  READ queries, table structures, and Information
  business entities                   

  User interface, devices, and public UI
  API surface                         

  Background jobs, offline tasks,     Automation
  external-system communication, and  
  event reactions                     

  User stories and acceptance         Slice details
  criteria                            

  Personas and user-role descriptions User Role lane details

  Context descriptions and team       System Context lane details
  responsibilities                    
  -----------------------------------------------------------------------

These are ownership guidelines, not a mandatory document template.
Choose headings and structure appropriate to the content. Slice details
do not have a fixed template.

#### Shared details versus process-specific details

An element may appear in multiple chapters. Its details are shared
across those placements, so element details should contain definitions
and specifications that remain valid wherever that element is used.

-   Put reusable business rules, contracts, definitions, and examples
    that clarify those shared rules in **element details**.
-   Put information that depends on a particular process step, scenario,
    or outcome in **slice details**. This includes user stories,
    acceptance criteria, and scenario-specific examples.
-   Put short, placement-specific explanations or illustrative values in
    the **element description**, keeping the visible-model and
    Presentation Mode constraints in mind.
-   Put user-role-wide information in User Role lane details and
    context/team-wide information in System Context lane details.

Do not put process-step-specific behavior into shared element details.
Conversely, do not duplicate a reusable definition in every slice just
because it is relevant there. If a detail would become misleading when
the same element is used in another chapter, it probably does not belong
in shared element details.

When changing an existing model, preserve useful existing specification
content. Do not overwrite or replace details blindly. If existing
statements conflict or the correct interpretation is unclear, surface
the conflict and ask for a decision rather than silently choosing one.

### 3. Exploration Mode: executable scenarios

Exploration Mode can turn a model into a simulation or prototype using
TypeScript, HTML, and a runtime that abstracts execution layers.
Scenario specification and implementation belong to the dedicated
Exploration Mode / scenario skill. HTML wireframes belong to the
dedicated HTML wireframe skill.

Keep the Event Modeling skill focused on the domain model and the
ownership of specification content. Do not move runtime implementation
details into element descriptions or treat a working prototype as a
substitute for a clear business specification.

## Chapters and paths

A chapter represents one user journey or business-process path.

-   A chapter flows in one direction.
-   Use a separate chapter for a genuinely different journey, such as
    choosing a different route through a process.
-   Name outcome slices so the distinction is understandable.
-   If an outcome slice represents a mutually exclusive outcome of a
    single trigger, follow one path in the current chapter and the alternative(s) in sibling chapters.

## Lanes and contexts

Use the three lane types and their intended element types:

  -----------------------------------------------------------------------
  Lane type               Purpose                 Allowed elements
  ----------------------- ----------------------- -----------------------
  User Role               User perspective and    UI, Automation
                          automated actors        

  Information Flow        Commands entering the   Command, Information
                          system and Information  
                          leaving it              

  System Context          The system or bounded   Event
                          context handling        
                          behavior                
  -----------------------------------------------------------------------

The **Information Flow** lane must never be renamed. Rename the User
Role lane to the actual actor or role, the first system lane is automatically named 
like the context of the chapter. If the chapter depends on elements from other contexts,
add a system lane for each foreign context.

### Working across contexts

When a chapter uses elements owned by another context:

-   Add a System Context lane named after the foreign context.
-   Place that foreign context's Events in its own lane.
-   Keep Commands and Information in the Information Flow lane, even
    when they belong to a foreign context.
-   prooph board visualizes the connection between the foreign System
    Context lane and the corresponding Command or Information using a
    dot and arrow.

Model the business interaction and ownership clearly. Do not move a
foreign context's Events into the current context just to make the
diagram look simpler.

## Slices

Slices represent steps in the process. Each slice should express one
coherent kind of behavior. Do not mix slice types.

### Read slice

Typical structure: `Information → UI` (UI is optional).

-   One or more Information elements in the Information Flow lane are
    required.
-   A UI element in the User Role lane is typical but optional. Omit it
    when information is consumed downstream rather than displayed.
-   Commands, Events, and Automation are not allowed.

A Read slice represents data read from the system, normally for display
or consumption. Information is the required element; UI is its usual
companion.

### Write slice

Typical structure: `UI (optional) → Command → Event(s)`.

-   Exactly one Command in the Information Flow lane.
-   One or more Events in the relevant System Context lane(s).
-   Information and Automation are not allowed.
-   Favor UI/Automation in read/automation slice followed by command + event in next write slice.

A Write slice represents a business action that changes system state.

### Automation slice

Typical structure: `Information (optional) → Automation`.

-   Represents an automated actor or trigger.
-   Information may be present when it is needed by the automation.
-   Commands and Events do not belong inside an Automation slice. If the
    automation leads to a state-changing action, model the action in a
    following Write slice or model an event reaction where appropriate.

### Event Reaction slice

Use an Event Reaction slice when an event triggers a reaction that
should be represented as a distinct process step. Keep the triggering
event and resulting behavior causally clear. Follow the existing model's
supported Event Reaction structure rather than inventing a new pattern.
Favor Event -> Information -> Automation. Model it using the "Todolist-Pattern".
Model direct event reactions only if it is clearly defined by the business process.

## Element semantics and naming

Names should use domain language that business stakeholders recognize.
Avoid leaking implementation details into the model.

### Command

A Command expresses an intention to perform a business action that may
change state.

-   Use an imperative verb phrase, such as `Place Order` or
    `Approve Application`.
-   A stakeholder should be able to say it as an intention.
-   A command should not merely describe loading or querying data;
    queries produce Information.
-   A command should be triggered by a preceding Read or Automation
    step, and should
    produce at least one business Event.

### Event

An Event represents a business fact: something that happened.

-   Use a past-tense business statement, such as `Order Placed`.
-   Events describe domain state changes or meaningful business
    outcomes, not implementation mechanics.
-   A stakeholder should recognize the event as an outcome.
-   Do not model UI interactions, technical notifications, or internal
    processing steps as business Events unless they represent a
    meaningful domain fact.

### Information

Information represents data read from the system.

-   Use a noun phrase in title case, such as `User Profile`,
    `Order Summary`, or `Invoice List`.
-   Name the data, not the machinery that produces it.
-   Queries produce Information, not Events.
-   Avoid class names, repository names, projector names, and other
    implementation terminology.

### UI

A UI element represents a screen or view, not an individual interaction.

-   Use the display name a user would recognize, such as `Dashboard`,
    `Order Overview Page`, or `User Profile Page`.
-   Describe interaction behavior in the appropriate specification
    details rather than turning each click or keystroke into a UI
    element or business Command.
-   Use the HTML wireframe skill when an interactive wireframe is
    needed.

### Automation

An Automation represents an automated actor, such as a scheduler,
background job, or notification service. Name the actor in
domain-relevant language.

### Hot Spot

Use a Hot Spot to make missing requirements, unclear business rules,
open questions, assumptions, or modeling concerns visible.

-   Write the question or concern in the element description so it is
    visible to collaborators.
-   Do not bury unresolved assumptions in detailed specifications.
-   Distinguish an **open question** from a **failure or skip outcome**.
    An open question records undecided behavior and blocks confidence in
    completeness until resolved. A modeled failure/skip outcome is
    decided behavior and is part of the specification.
-   When resolving an open question, update it to record the ruling and
    rejected alternatives rather than erasing useful decision history.
-   Do not count a modeled failure outcome as an unresolved question.

## Reusing elements across chapters

prooph board synchronizes elements with the same **name, type, and
context**. Reuse the same element when the same domain concept or
contract appears in multiple chapters; do not create near-duplicates
just to represent another occurrence.

-   Name, type, and context together determine identity.
-   The same name with a different type or context represents a
    different element.
-   Element descriptions are placement-specific, so they can explain
    what the element means at that point in the process.
-   Element details are shared, so they must remain valid across all
    placements.
-   Slice details hold process-step-specific behavior.

Consider the impact of shared details before changing them, because a
change can affect other chapters.

## Causality and flow

The model must show why each step can happen and where its required
information comes from.

### Start of process

A process should start with a Read or Automation slice. Before the first
Write:

-   Required data must exist.
-   The actor must be able to access the data.
-   If required information is not already available, model a Read
    first.

### Read-to-read flow

When one Event provides data for multiple independent views, each view
can be represented by its own Read slice immediately after the Write
slice. Do not introduce another Event merely to bridge those reads.

### UI-to-ui flow

User Interface navigation can be modeled using two consecutive Read slices. The first
Read slice represents the source UI, and the second Read slice represents
the target UI. 

### Command-to-event flow

A Command connects to the Event in its Write slice. If consecutive
following slices contain Events without a new Command, the originating
Command also connects to those Events. The chain stops when a new
Command appears or a slice contains no Event.

When one Command produces several domain Events, model each Event in its
own slice without adding a new Command for each one.

### UI/Automation-to-command flow

A UI or Automation connects to the Command in its slice, or the next
slice if the current slice has no Command. 

Transitions must represent a valid causal flow. If the relationship is
not clear, investigate it rather than adding elements solely
to make the timeline appear connected.

## Anti-patterns

Challenge these patterns during modeling and review:

-   **Data-loading Commands:** use Information to represent queries and
    their results.
-   **UI interactions modeled as Events:** model business facts, not
    clicks or screen changes.
-   **Technical Events:** prefer meaningful domain outcomes over
    internal implementation signals.
-   **Software-first processes:** first ask how the work happens in the
    real world and who is responsible.
-   **Unexplained Commands:** every Command needs a plausible trigger
    and business outcome.
-   **Overloaded descriptions:** keep the visible model concise and move
    reusable or process-specific specification content to the
    appropriate details.
-   **Process-specific content in shared element details:** move it to
    the relevant slice details when the content depends on that process
    step.
-   **Duplicated elements:** reuse synchronized elements when name,
    type, and context are the same.
-   **Hidden assumptions:** ask questions or create Hot Spots rather
    than presenting assumptions as facts.
-   **Mixed slice types:** each slice should represent one coherent
    behavior.

## Modeling approach

Use this order as a guide, not as a rigid ceremony:

1.  Ask the user about the business problem and unresolved questions.
2.  Identify the actor and the system or bounded context.
3.  Discover important domain Events.
4.  Establish lanes.
5.  Arrange slices according to causality.
6.  Add or refine Events as domain understanding improves.
7.  Add Commands, Information, UI, and Automation where they belong.
8.  Attach specification content to the correct element, lane, or slice.
9.  Validate the model and surface remaining Hot Spots.

Model the process without software first. Ask who acts, what triggers an
action, what information is used, what changes, and what happens when
the expected path does not work.

## Hot Spot discovery

Pause and investigate when the model leaves uncertainty around:

-   process completion
-   data origin or availability
-   repetition and retries
-   concurrency
-   time constraints
-   abandonment
-   error handling
-   authorization
-   responsibility across contexts

Ask the user a focused question or record the uncertainty as a Hot Spot.
Do not silently resolve a domain question by guessing.

## Validation checklist

In Critic Mode, and during final validation in Modeling Mode, check:

-   [ ] User Role and System Context lanes are named for the actual
    actor and system/context; Information Flow is unchanged.
-   [ ] Each slice represents exactly one slice type: Read, Write,
    Automation, or Event Reaction.
-   [ ] Commands and Information are in Information Flow; Events are in
    their owning System Context; UI and Automation are in User Role.
-   [ ] The process starts with a Read or Automation slice.
-   [ ] Every Command has a plausible trigger and produces at least one
    Event.
-   [ ] Events are not placed inside Automation slices.
-   [ ] Commands express imperative business intent; Events describe
    past-tense business facts.
-   [ ] There are no data-loading Commands, UI-interaction Events, or
    unjustified technical Events.
-   [ ] Slice transitions follow valid causality and flow.
-   [ ] Reused elements have the same name, type, and context.
-   [ ] Shared element details contain reusable specifications;
    process-specific behavior belongs in slice details.
-   [ ] Descriptions remain concise and suitable for the visible model
    and Presentation Mode.
-   [ ] Assumptions and unresolved business questions are visible as
    questions or Hot Spots.
-   [ ] Remaining gaps, contradictions, and decisions needed from the
    human are reported.

A model can be structurally valid and still be incomplete as a business
specification. Do not claim the process is fully specified while
important business questions remain unresolved.
