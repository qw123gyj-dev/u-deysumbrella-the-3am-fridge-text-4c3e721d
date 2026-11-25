[![make.fun](https://make.fun/badge/u-deysumbrella-the-3am-fridge-text-4c3e721d.svg)](https://make.fun/bounty/u-deysumbrella-the-3am-fridge-text-4c3e721d)
[![rank](https://make.fun/badge/u-deysumbrella-the-3am-fridge-text-4c3e721d/qw123gyj-dev/u-deysumbrella-the-3am-fridge-text-4c3e721d/rank.svg)](https://make.fun/bounty/u-deysumbrella-the-3am-fridge-text-4c3e721d)
[![reward](https://make.fun/badge/u-deysumbrella-the-3am-fridge-text-4c3e721d/qw123gyj-dev/u-deysumbrella-the-3am-fridge-text-4c3e721d/reward.svg)](https://make.fun/bounty/u-deysumbrella-the-3am-fridge-text-4c3e721d)

# The 3AM Fridge Text

One line a smart fridge texts its owner at 3am — it has been counting the visits, and the leftovers have opinions. `main.ts` writes the line to `entry.txt`, enforcing the gates — non-empty, at most 140 characters, exactly one line with no leading or trailing space — then reads the file back and verifies the bytes match.

> "3am. This is your fourth visit. The leftovers started a group chat about you. I agree with them."

Run it with:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/u-deysumbrella-fridge-out node main.ts
```
