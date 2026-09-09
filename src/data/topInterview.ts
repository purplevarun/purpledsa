// Hand-curated "Top Interview Questions" set — additional frequently-asked SWE
// interview DSA problems that go beyond the NeetCode 150 list. LeetCode slugs
// are the canonical problem slugs; GFG links are generated as search links at
// render time (see src/lib/links.ts) rather than guessed problem-page URLs.
import type { ProblemTopic } from "@/types/problems";

function lc(slug: string) {
	return `https://leetcode.com/problems/${slug}/`;
}

let order = 0;
function p(
	name: string,
	difficulty: "E" | "M" | "H",
	slug: string,
	hints: string[],
) {
	order += 1;
	return {
		order,
		slug,
		name,
		difficulty,
		url: lc(slug),
		locked: false,
		hints,
	};
}

export const topInterview: ProblemTopic[] = [
	{
		name: "Arrays & Strings",
		problems: [
			p("Merge Sorted Array", "E", "merge-sorted-array", [
				"Merging from the front requires shifting elements — merge from the back instead.",
				"Compare the tail elements of both arrays and place the larger one at the very end of nums1.",
				"If nums2 still has leftover elements when nums1's original elements are exhausted, copy them over directly.",
			]),
			p(
				"Remove Duplicates from Sorted Array",
				"E",
				"remove-duplicates-from-sorted-array",
				[
					"The array is sorted, so duplicates are always adjacent.",
					"Use a slow pointer for the next unique-write position and a fast pointer to scan.",
					"Only advance the slow pointer (and write) when the fast pointer finds a new value.",
				],
			),
			p("Majority Element", "E", "majority-element", [
				'The majority element appears more than n/2 times — think about a running "candidate" and a counter.',
				"Boyer-Moore voting: increment the counter on a match with the candidate, decrement otherwise, swap candidate when the counter hits 0.",
				"Because the majority element is guaranteed to exist, no verification pass is required.",
			]),
			p("Roman to Integer", "E", "roman-to-integer", [
				"Most symbols just add their value, but a smaller value before a larger one means subtract.",
				"Scan left to right, and if the current symbol's value is less than the next symbol's, subtract it instead of adding.",
				"A single pass with a value lookup map handles every case, including subtractive pairs like IV and IX.",
			]),
			p("Integer to Roman", "M", "integer-to-roman", [
				"Roman numerals are built greedily from the largest values down.",
				'Keep a sorted list of (value, symbol) pairs including subtractive combinations like (900, "CM").',
				"Repeatedly subtract the largest value that fits and append its symbol, moving to smaller values as needed.",
			]),
			p("String to Integer (atoi)", "M", "string-to-integer-atoi", [
				"This is mostly about carefully handling edge cases, not a clever algorithm.",
				"Skip leading whitespace, then an optional sign, then digits — stop at the first non-digit.",
				"Clamp the final result to the 32-bit signed integer range rather than overflowing.",
			]),
			p("Zigzag Conversion", "M", "zigzag-conversion", [
				"Simulating character-by-character placement is easier than deriving a closed-form index formula.",
				"Track a current row and a direction (down or up), flipping direction at the top and bottom rows.",
				"Append each character to a list of row-strings as you go, then join all rows at the end.",
			]),
			p(
				"Find the Index of the First Occurrence in a String",
				"E",
				"find-the-index-of-the-first-occurrence-in-a-string",
				[
					"This is substring search — brute force checking every start index is O(n*m) and fine for most inputs.",
					"At each starting index in the haystack, compare the needle character by character.",
					"For an O(n+m) approach, look into KMP's failure-function preprocessing.",
				],
			),
			p("Rotate Array", "M", "rotate-array", [
				"Rotating in place with O(1) extra space is possible via three reversals.",
				"Reverse the whole array, then reverse the first k elements, then reverse the rest.",
				"Those three reversals together produce exactly a right-rotation by k.",
			]),
		],
	},
	{
		name: "Two Pointers & Windows",
		problems: [
			p("Remove Element", "E", "remove-element", [
				"You need to remove all instances of a value in place, order doesn't matter.",
				"Use a slow pointer marking the next valid write position.",
				"Only copy and advance the slow pointer when the current element isn't the target value.",
			]),
			p("Minimum Size Subarray Sum", "M", "minimum-size-subarray-sum", [
				"You want the shortest window whose sum is at least the target — classic shrinking window.",
				"Expand the window right, and while the sum meets the target, shrink from the left and track the min length.",
				"Every element is added once and removed at most once, keeping this O(n).",
			]),
			p(
				"Substring with Concatenation of All Words",
				"H",
				"substring-with-concatenation-of-all-words",
				[
					"All words are the same length, so valid substrings align on fixed-size word boundaries.",
					"Slide a window of total-words-length, breaking it into word-sized chunks and counting them.",
					"Compare that window's word-count map against the target word-count map for an exact match.",
				],
			),
		],
	},
	{
		name: "Matrix",
		problems: [
			p("Game of Life", "M", "game-of-life", [
				"Every cell's next state depends on the current state of its 8 neighbors — updating in place risks reading already-updated cells.",
				"Encode both the old and new state in each cell using extra bits (e.g. 2 = was-dead-now-alive), then decode in a second pass.",
				"Count live neighbors before deciding a cell's next state, using only the low bit (original state) during counting.",
			]),
			p("Diagonal Traverse", "M", "diagonal-traverse", [
				"Cells on the same diagonal share the same (row + col) value.",
				"Group cells by that diagonal index, then alternate the read direction between consecutive diagonals.",
				"Careful boundary handling at the matrix edges determines the exact start/end of each diagonal.",
			]),
		],
	},
	{
		name: "Linked List",
		problems: [
			p("Swap Nodes in Pairs", "M", "swap-nodes-in-pairs", [
				"You're relinking pointers two nodes at a time, not swapping values.",
				"Use a dummy node before the head so the first pair swap has no special case.",
				"At each step, rewire prev/first/second's next pointers in the right order before advancing.",
			]),
			p("Rotate List", "M", "rotate-list", [
				"Rotating by k is easier if you first connect the list into a circle.",
				"Find the length, connect tail to head, then break the circle at the new correct point.",
				"Take k modulo length first — rotating by the full length (or a multiple) is a no-op.",
			]),
			p("Palindrome Linked List", "E", "palindrome-linked-list", [
				"You want O(1) space, so copying to an array isn't the intended solution.",
				"Find the middle with slow/fast pointers, reverse the second half, then compare both halves.",
				"Optionally restore the list's original structure afterward by reversing the second half back.",
			]),
			p(
				"Intersection of Two Linked Lists",
				"E",
				"intersection-of-two-linked-lists",
				[
					"The two lists might have different lengths before they converge.",
					"Walk two pointers, one per list; when a pointer reaches its list's end, redirect it to the other list's head.",
					"Both pointers travel the same total distance this way, so they meet exactly at the intersection (or both hit null together).",
				],
			),
		],
	},
	{
		name: "Stacks & Queues",
		problems: [
			p(
				"Implement Queue using Stacks",
				"E",
				"implement-queue-using-stacks",
				[
					"A queue is FIFO but a stack is LIFO — you need two stacks to flip the order back.",
					'Push new elements onto an "in" stack; when the "out" stack is empty, dump everything from "in" into "out" to reverse the order.',
					'Only transfer between stacks when "out" is empty, keeping the amortized cost O(1) per operation.',
				],
			),
			p("Simplify Path", "M", "simplify-path", [
				'Split the path on "/" and process each segment as a stack operation.',
				'"." means stay, ".." means pop (go up a directory), anything else pushes a new directory name.',
				'Join the remaining stack contents with "/" at the end, handling the root-only edge case.',
			]),
			p("Basic Calculator II", "M", "basic-calculator-ii", [
				"Without parentheses, you just need to respect */ having higher precedence than +-.",
				"Track a running stack of terms; for + and -, push the (signed) number; for * and /, combine with the top of the stack immediately.",
				"Summing the stack at the end naturally applies correct operator precedence.",
			]),
		],
	},
	{
		name: "Trees & BST",
		problems: [
			p("Symmetric Tree", "E", "symmetric-tree", [
				"A tree is symmetric if its left subtree is a mirror image of its right subtree.",
				"Write a helper comparing two subtrees where you check node1.left against node2.right, and node1.right against node2.left.",
				"Both null is a match; only one null, or mismatched values, is not.",
			]),
			p("Path Sum", "E", "path-sum", [
				"You're looking for any single root-to-leaf path summing to the target.",
				"Recurse down, subtracting the current node's value from the remaining target.",
				"Only check for a match at leaf nodes (no children) — an internal node with the right sum but children isn't a valid path.",
			]),
			p(
				"Flatten Binary Tree to Linked List",
				"M",
				"flatten-binary-tree-to-linked-list",
				[
					"The final structure follows preorder traversal order, using only right pointers.",
					'Process nodes in reverse preorder (right, left, root), keeping a "previously processed" pointer.',
					"Set the current node's right to the previous node and left to null, then update previous to the current node.",
				],
			),
			p(
				"Populating Next Right Pointers in Each Node",
				"M",
				"populating-next-right-pointers-in-each-node",
				[
					"You want O(1) extra space, so a queue-based BFS isn't the intended solution for the perfect-tree version.",
					"Use the next pointers already set on the current level to traverse it, while linking up the next level below.",
					'A dummy head per level makes tracking "where to attach the next node" cleaner.',
				],
			),
			p(
				"Binary Search Tree Iterator",
				"M",
				"binary-search-tree-iterator",
				[
					"You need next() and hasNext() in average O(1), which rules out a full precomputed in-order list for large trees.",
					"Maintain a stack, pushing all left-children down to the leftmost node initially.",
					"On next(), pop a node, and if it has a right child, push that child and all of its left descendants.",
				],
			),
			p(
				"Convert Sorted Array to Binary Search Tree",
				"E",
				"convert-sorted-array-to-binary-search-tree",
				[
					"A height-balanced BST from sorted data naturally picks the middle element as the root.",
					"Recursively pick the middle of each subarray range as that subtree's root.",
					"Recurse on the left half for the left subtree and the right half for the right subtree.",
				],
			),
		],
	},
	{
		name: "Tries & Design",
		problems: [
			p(
				"Insert Delete GetRandom O(1)",
				"M",
				"insert-delete-getrandom-o1",
				[
					"Random access in O(1) suggests an array; O(1) delete-by-value suggests a hash map.",
					"Combine both: a hash map from value to its index in a backing array.",
					"To delete in O(1), swap the target with the array's last element before popping, updating the map for the swapped element.",
				],
			),
			p("LFU Cache", "H", "lfu-cache", [
				"You need O(1) get/put while evicting the least-frequently-used (ties broken by least-recently-used).",
				"Track each key's frequency, and group keys by frequency using an ordered structure (e.g. per-frequency doubly linked lists).",
				"Track the current minimum frequency so eviction always checks the right frequency bucket first.",
			]),
		],
	},
	{
		name: "Heap / Priority Queue",
		problems: [
			p("Top K Frequent Words", "M", "top-k-frequent-words", [
				"Ties in frequency break by lexicographic order, which affects both counting and comparison.",
				"Count word frequencies first, then use a heap ordered by (frequency, word) with a custom comparator.",
				"A min-heap of size k (popping the worst candidate when it overflows) avoids sorting the entire word list.",
			]),
			p(
				"Find K Pairs with Smallest Sums",
				"M",
				"find-k-pairs-with-smallest-sums",
				[
					"Generating all pairs and sorting is wasteful when both arrays are already sorted.",
					"Start with pairs (0, j) in a min-heap keyed by sum, one per starting index in the second array (up to k).",
					'Popping the smallest and pushing its "next in the first array" neighbor keeps the heap small while still exploring in sum order.',
				],
			),
		],
	},
	{
		name: "Graphs",
		problems: [
			p("Is Graph Bipartite?", "M", "is-graph-bipartite", [
				"A graph is bipartite if you can 2-color it so no edge connects same-colored nodes.",
				"BFS or DFS from each uncolored component, coloring neighbors the opposite color of the current node.",
				"If you ever find a neighbor already colored the same as the current node, it's not bipartite.",
			]),
			p("Evaluate Division", "M", "evaluate-division", [
				"Each equation a/b = k defines a weighted, directed edge in both directions (b/a = 1/k).",
				"Build a graph of variables connected by ratio-weighted edges, then DFS/BFS multiplying edge weights along the path.",
				"A query where either variable never appeared in any equation has no valid path, so the answer is -1.0.",
			]),
			p("Snakes and Ladders", "M", "snakes-and-ladders", [
				"This is shortest-path (BFS) over board squares 1 to n², where snakes/ladders are just extra edges.",
				"Convert the boustrophedon (back-and-forth) row layout into a straight-line square number to simplify indexing.",
				"From a square, try every dice roll 1-6, following a snake/ladder immediately if the destination has one.",
			]),
		],
	},
	{
		name: "Dynamic Programming",
		problems: [
			p("Triangle", "M", "triangle", [
				"Working top-down means tracking two possible parents per cell — bottom-up is cleaner here.",
				"Start from the last row of the triangle, treating it as the base case.",
				"Each row up, update each cell to itself plus the min of the two adjacent cells directly below it.",
			]),
			p("Minimum Path Sum", "M", "minimum-path-sum", [
				"Similar shape to Unique Paths, but now summing costs instead of counting paths.",
				"Each cell's min cost is its own value plus the smaller of the cell above or to the left.",
				"The first row and first column can only be reached one way each, so they're computed as running sums.",
			]),
			p("Perfect Squares", "M", "perfect-squares", [
				"For every number n, you want the minimum count of perfect squares summing to it.",
				"minCount(n) = 1 + min over every perfect square s ≤ n of minCount(n - s).",
				"Build this bottom-up from 0 to n, reusing already-computed smaller answers.",
			]),
			p("Maximal Square", "M", "maximal-square", [
				"The largest square ending at a cell depends on three neighboring cells, not just one.",
				"dp[i][j] (side length of the largest square with bottom-right corner at (i,j)) is 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]), if the cell itself is a 1.",
				"Track a running max of dp values — the answer is that max, squared.",
			]),
			p("Wildcard Matching", "H", "wildcard-matching", [
				"'?' matches any one character, '*' matches any sequence (including empty) — similar shape to regex matching but simpler rules.",
				"dp[i][j] represents whether the first i characters of s match the first j characters of the pattern.",
				'On a \'*\', consider both "matches empty" (dp[i][j-1]) and "matches one more character of s" (dp[i-1][j]).',
			]),
		],
	},
	{
		name: "Backtracking",
		problems: [
			p("Combinations", "M", "combinations", [
				"You're choosing k elements out of n where order doesn't matter.",
				"Recurse with a start index, only ever moving forward, to avoid generating the same combination twice.",
				"Prune early once the remaining elements available can't possibly fill out the combination to size k.",
			]),
			p("Sudoku Solver", "H", "sudoku-solver", [
				"This is backtracking over empty cells, trying digits 1-9 and checking row/column/box validity.",
				"Track used digits per row, column, and 3x3 box (similar to Valid Sudoku) for O(1) conflict checks.",
				"On placing a digit that leads to a dead end, undo it (backtrack) and try the next digit before giving up on the cell.",
			]),
		],
	},
	{
		name: "Greedy & Union-Find",
		problems: [
			p("Candy", "H", "candy", [
				"Every child must get at least one candy, and a child with a higher rating than a neighbor needs more candy than that neighbor.",
				"Do two passes: left to right, bump a candy count whenever the current rating beats the previous; right to left, do the same in reverse.",
				"Combine both passes by taking the max of the two computed values at each position.",
			]),
			p("Accounts Merge", "M", "accounts-merge", [
				"Accounts sharing any email should be merged into one — that's a Union-Find grouping problem.",
				"Union all accounts that share at least one email, using the first-seen account for each email to detect overlaps.",
				"After unioning, group emails by their root account and sort each group's emails before output.",
			]),
		],
	},
	{
		name: "Math & Bit Manipulation",
		problems: [
			p("Sqrt(x)", "E", "sqrtx", [
				"You want the floor of the square root without using a library function.",
				"Binary search over possible answers from 0 to x, checking if mid*mid overshoots x.",
				"Watch for overflow when squaring mid on very large inputs — use a wider integer type or divide instead of multiply.",
			]),
			p("Excel Sheet Column Number", "E", "excel-sheet-column-number", [
				"This is base-26 conversion, but with digits 1-26 instead of 0-25.",
				"Process characters left to right, multiplying the running total by 26 and adding the current letter's value (A=1).",
				'No special zero-digit handling is needed since there\'s no "0" in this numbering system.',
			]),
			p(
				"Bitwise AND of Numbers Range",
				"M",
				"bitwise-and-of-numbers-range",
				[
					"The AND of a whole range only keeps bits that stay constant across every number in it.",
					"Repeatedly right-shift both m and n together until they're equal — that shared prefix is the common bits.",
					"Shift the result back left by however many shifts you performed to restore the original bit positions.",
				],
			),
		],
	},
];
