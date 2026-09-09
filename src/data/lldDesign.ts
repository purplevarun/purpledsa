// Hand-curated Low-Level Design (LLD) / machine-coding interview problems.
// These have no canonical LeetCode page, so `url` links to a GitHub code
// search for reference implementations rather than a guessed exact page.
import { githubSearchUrl } from "@/lib/links";
import type { ProblemTopic } from "@/types/problems";

let order = 0;
function p(name: string, difficulty: "E" | "M" | "H", hints: string[]) {
	order += 1;
	return {
		order,
		slug: name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, ""),
		name,
		difficulty,
		url: githubSearchUrl(`${name} low level design`),
		locked: false,
		hints,
	};
}

export const lldDesign: ProblemTopic[] = [
	{
		name: "Caching",
		problems: [
			p("Design LRU Cache", "M", [
				"Needs O(1) get/put — combine a hash map (key → node) with a doubly linked list ordered by recency.",
				"Core classes: Cache, Node (key, value, prev, next). Move a node to the front on every access.",
				"Evict from the tail when capacity is exceeded; watch for the head/tail sentinel-node edge cases.",
			]),
			p("Design LFU Cache", "H", [
				"Eviction needs least-frequently-used, ties broken by least-recently-used.",
				"Track per-key frequency, and group keys by frequency using an ordered structure (frequency → doubly linked list of keys).",
				"Track the current minimum frequency so eviction always checks the right bucket in O(1).",
			]),
			p("Design a Distributed Cache", "H", [
				"Think about consistent hashing to shard keys across nodes without a full rehash on scale-out.",
				"Core components: Node ring, hash function, replication factor for fault tolerance.",
				"Consider cache invalidation strategy (TTL vs. write-through vs. write-back) as a first-class design decision.",
			]),
		],
	},
	{
		name: "Concurrency Primitives",
		problems: [
			p("Design a Rate Limiter", "M", [
				"Multiple algorithms fit: token bucket, leaky bucket, fixed window, sliding window log/counter — pick one and justify it.",
				"Core interface: `boolean allowRequest(clientId)`, backed by per-client state (tokens remaining, last refill time).",
				"Token bucket needs a thread-safe refill calculation based on elapsed time, not a background timer, to stay simple and testable.",
			]),
			p("Design a Bounded Blocking Queue", "M", [
				"Producers block when full, consumers block when empty — classic producer-consumer.",
				"Use a mutex plus two condition variables (not-full, not-empty), or a language-native construct (e.g. Java's `ReentrantLock` + `Condition`).",
				"Handle spurious wakeups by re-checking the condition in a while-loop, not an if-check.",
			]),
			p("Design a Thread Pool", "H", [
				"Core pieces: a task queue, a fixed set of worker threads, and a shutdown mechanism.",
				"Workers loop: pull a task from the queue (blocking if empty) and execute it, catching exceptions so one bad task doesn't kill a worker.",
				"Support graceful shutdown (finish queued tasks) vs. immediate shutdown (drop queued tasks) as two distinct modes.",
			]),
			p("Design a Circuit Breaker", "M", [
				"Three states: Closed (calls flow normally), Open (calls fail fast), Half-Open (a trial call tests recovery).",
				"Track a rolling failure count/rate to decide when to trip from Closed to Open.",
				"After a cooldown period, allow one trial request through (Half-Open) — success closes the circuit, failure reopens it.",
			]),
		],
	},
	{
		name: "Classic Machine Coding Systems",
		problems: [
			p("Design a Parking Lot System", "M", [
				"Model spot types (compact/large/handicap) and vehicle types, and match them via a strategy for spot assignment.",
				"Core classes: ParkingLot, Level, Spot, Vehicle, Ticket — a Ticket ties a Vehicle to a Spot with an entry timestamp.",
				"Fee calculation is a separate strategy/interface so pricing rules can change without touching the core allocation logic.",
			]),
			p("Design an Elevator System", "H", [
				"Model elevator state (idle, moving up, moving down, door open) and pending requests (external floor calls + internal floor selections).",
				"The scheduling algorithm (e.g. SCAN/LOOK — [REDACTED_SQL_PASSWORD_1]ing floors in one direction before reversing) is the core interesting design decision.",
				"Separate the Elevator (single car) from an ElevatorController (assigns requests to the best car in a multi-elevator building).",
			]),
			p("Design a Vending Machine", "E", [
				"Model as a state machine: Idle → Has Money → Dispensing → Idle, with clear transitions.",
				"Core classes: Inventory (item → count/price), Product, PaymentStrategy (cash/card as interchangeable strategies).",
				"Handle edge cases explicitly: insufficient funds, out-of-stock item, and making change.",
			]),
			p("Design an ATM Machine", "M", [
				"Model as a state machine similar to a vending machine: Idle → Card Inserted → PIN Entered → Transaction → Dispensing.",
				"Core classes: Account, Card, CashDispenser (tracks denominations available), Transaction (Withdraw/Deposit/CheckBalance as a strategy/command).",
				'The cash dispenser\'s "minimum number of notes" calculation is a small greedy sub-problem worth isolating into its own method.',
			]),
			p("Design a Logging Framework", "M", [
				"Core interface: `Logger.log(level, message)`, with a chain of LogAppenders (console, file, network) that can be added independently.",
				"Use the Chain of Responsibility pattern for log level filtering — each handler decides whether to pass a message along.",
				"Make the log format and destination configurable without changing call sites — that's the whole point of the abstraction.",
			]),
			p("Design an In-Memory File System", "H", [
				"Model directories and files as a tree — a Directory node holds a map of name → (File | Directory).",
				"Core operations: mkdir, addFile/writeFile, ls, and a path-resolution helper that walks the tree from root.",
				'Decide whether paths are absolute-only or need to support relative paths and ".." — that changes the resolution logic significantly.',
			]),
			p("Design a Notification System", "M", [
				"Core interface: `NotificationService.send(user, message, channel)`, with channel as a strategy (email/SMS/push).",
				'Use the Observer pattern if notifications are triggered by domain events (e.g. "order shipped") rather than called directly.',
				"Consider retry/fallback: if push fails, fall back to email — that's a decorator or chain around the base strategy.",
			]),
		],
	},
	{
		name: "Booking & Marketplace Systems",
		problems: [
			p("Design a Movie Ticket Booking System", "H", [
				"Core entities: Theater, Screen, Show (a Movie at a Screen at a time), Seat, Booking.",
				'Concurrent seat selection is the crux of the design — use pessimistic locking (or a short-lived "hold" with expiry) to prevent double-booking.',
				"Separate seat pricing (category-based) from booking/payment flow so pricing rules can evolve independently.",
			]),
			p("Design a Hotel Booking System", "M", [
				"Core entities: Hotel, RoomType, Room, Reservation — a Reservation spans a date range, not just a single day.",
				"Availability checking is a range-overlap problem per room — index reservations by room and date range for fast lookups.",
				"Keep pricing (seasonal/dynamic rates) as a pluggable strategy separate from the reservation/availability logic.",
			]),
			p("Design Splitwise (Expense Sharing)", "H", [
				"Core entities: User, Group, Expense (paid-by + split-among with a SplitStrategy: equal/exact/percentage).",
				"Maintain a balance sheet (who-owes-whom) as a graph, and simplify debts by netting out cycles (minimize total transactions).",
				'The "simplify debts" step is the interesting algorithmic sub-problem — greedy settle-up using max-owed/max-owes pairing.',
			]),
			p("Design a Car Rental System", "M", [
				"Core entities: Vehicle, Branch (location + inventory), Reservation (date range + vehicle category).",
				"Availability search should filter by branch, date range, and vehicle category simultaneously.",
				"Pricing depends on rental duration and vehicle category — model it as a separate pricing strategy, not inline logic.",
			]),
			p("Design a URL Shortener", "M", [
				"Core operation: map a long URL to a short code and back — a key-value store is the backbone.",
				"Short code generation: either a counter encoded in base62, or a hash of the URL truncated and checked for collisions.",
				"Decide read vs. write ratio assumptions up front — this is a heavy-read system, so caching hot redirects matters.",
			]),
		],
	},
	{
		name: "Games",
		problems: [
			p("Design Tic-Tac-Toe", "E", [
				"Core classes: Board (grid + win-check), Player, Game (turn management).",
				"Win-checking after every move only needs to check the row/column/diagonal through the just-played cell, not the whole board.",
				"Keep the board size configurable (n×n) so the win-check logic doesn't hardcode 3.",
			]),
			p("Design a Snake and Ladder Game", "M", [
				"Core classes: Board (cells with snake/ladder jump targets), Player, Dice, Game (turn loop).",
				'Model snakes and ladders uniformly as a single map of "jump-from cell → jump-to cell".',
				"The turn loop is simple, but handle the exact-landing-on-100 rule (or equivalent) as an explicit edge case if required.",
			]),
			p("Design a Chess Game", "H", [
				"Core classes: Board, Piece (abstract, with subclasses per piece type implementing move validation), Move, Player.",
				"Each piece subclass implements its own `isValidMove()` — this is the textbook Strategy/polymorphism example for LLD interviews.",
				"Check/checkmate detection is the hardest part: after any candidate move, simulate it and verify the player's own king isn't left in check.",
			]),
		],
	},
];
