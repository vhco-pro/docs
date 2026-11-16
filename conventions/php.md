---
title: "PHP conventions"
type: guideline
description: "Write typed, maintainable PHP with explicit platform contracts, safe effects and executable quality checks."
status: active
---

# PHP conventions

Apply [coding](coding.md) as well. Read this page when specifying, writing or reviewing PHP.
The recommendations below are our policy. The linked primary sources establish language behavior,
platform contracts and tool capabilities. A project's checked configuration and executed tests establish adoption.

## Runtime and style

Record supported PHP versions, required extensions and the host framework's version before choosing
syntax, dependencies or tools. Run compatibility checks against each supported target. A development
machine with a newer interpreter cannot establish compatibility with an older appliance.

PHP source runs through the PHP runtime, which compiles it to opcodes for execution. A project's build
may install locked dependencies, generate files or assemble a deployable package. For an OPNsense
plugin, the native build packages PHP, models, templates and metadata for the appliance. Record those
steps separately from syntax checks and verify the resulting package on the supported runtime.
[PHP execution and opcode caching](https://www.php.net/manual/en/book.opcache.php), [OPNsense package development](https://docs.opnsense.org/development/examples/helloworld.html).

Follow the host project's declared style. For a new standalone project, select and pin a released
PHP-FIG PER Coding Style version and a compatible checker. OPNsense explicitly uses PSR-12, so its
plugins use PSR-12. Keep style fixes confined to touched code. Pure PHP files omit the closing tag.
[PHP-FIG PER](https://www.php-fig.org/per/coding-style/), [PSR-12](https://www.php-fig.org/psr/psr-12/), [OPNsense coding guidelines](https://docs.opnsense.org/development/guidelines/basics.html).

## Types and input boundaries

Use native parameter, property and return declarations where the supported runtime and inherited
contract permit them. New standalone PHP files use `declare(strict_types=1)`. Framework integration
must preserve parent/interface signatures and test the actual callers' coercion behavior. Scalar argument
checking follows the calling file's mode. Scalar return checking follows the function-definition file's
mode. These declarations do not validate an HTTP request, XML document or framework model.
[PHP type declarations](https://www.php.net/manual/en/language.types.declarations.php), [implemented scalar-types RFC](https://wiki.php.net/rfc/scalar_type_hints_v5), [method variance](https://www.php.net/manual/en/language.oop5.variance.php).

Validate external values before conversion. Define the meaning of missing, null, empty and zero for
each boundary. Use strict comparisons when testing sentinel results such as `false`. Handle a successful
zero-byte result according to the operation's contract. Keep `mixed` at the particular
external boundary and narrow it before domain use. PHPDoc describes array shapes, collections and
information native declarations cannot express. Avoid annotations that only repeat native types.

## Design and dependencies

Keep request handlers, framework adapters and CLI entry points small. Put decisions in ordinary methods
that can be tested with explicit inputs. Pass dependencies through constructors or method parameters
when it makes ownership and effects clearer. Framework-required service lookup stays at the integration
boundary. Prefer composition for ordinary application behavior and the framework's required inheritance
for its extension points.
[PHP-FIG dependency guidance](https://www.php-fig.org/psr/psr-11/meta/).

Reuse the existing model, validation, process and cryptographic APIs when they satisfy the contract.
Introduce an interface when callers need a real substitution or an effect needs a controlled test
boundary. A class, factory, repository or container must have a concrete responsibility. Avoid parallel
validation frameworks, generic service layers and an interface for every class.

For standalone Composer projects, use the project's autoloader and PSR-4 mapping. A hosted plugin uses
the host's loader and package dependencies. Developer tooling can use Composer without making Composer
a production requirement. Applications and this tooling commit their lock file and install from it in
CI. Record runtime/extension constraints and check the actual target with `check-platform-reqs` when
Composer manages its runtime dependencies. An emulated `config.platform` alone is insufficient.
[PSR-4](https://www.php-fig.org/psr/psr-4/), [Composer usage](https://getcomposer.org/doc/01-basic-usage.md), [platform checks](https://getcomposer.org/doc/03-cli.md#check-platform-reqs).

## Failure and resource handling

Check documented failure results and process exit codes. Catch an expected exception where the caller
can recover or translate it into a useful boundary error. Preserve the cause for protected diagnostics
and expose a sanitized failure category to users. Broad catches must preserve a failed outcome. Avoid
`@` suppression or an empty catch that turns unreadable input, failed encryption or a rejected write
into apparent success. Keep production error details out of HTTP responses.
[PHP throwable handling](https://www.php.net/manual/en/language.error-handling.throwable.php), [error reporting](https://www.php.net/manual/en/security.errors.php).

Use `finally` to release acquired locks, close streams and remove owned temporary files on handled
failure paths. Specify recovery for termination that bypasses cleanup. Lock the complete read/change/
verify sequence when concurrent calls can corrupt state. Advisory locks require every writer to
cooperate. Check write results and publish completed state through an appropriate atomic replacement.
Document filesystem and durability assumptions. A local write or process success alone does not prove
remote retention. Failure, retry and lost-response cases belong in the feature's tests.
[PHP flock](https://www.php.net/manual/en/function.flock.php), [file writes](https://www.php.net/manual/en/function.file-put-contents.php).

## Processes, files and untrusted data

Use an existing safe process API or an argument-vector invocation that avoids shell interpretation.
Validate executable, options, operands and destination constraints too, since argument separation
still permits option injection. Use an option terminator where the invoked command supports it.
Set bounded execution and output handling for commands that can block. Keep secrets out of process
arguments, logs, traces and captured test evidence.
[PHP proc_open](https://www.php.net/manual/en/function.proc-open.php), [OWASP command injection](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html).

Create secret-bearing temporary files in an owned private directory with restrictive permissions
from creation. `tempnam()` protects its own file, and a separately created sidecar needs its own
permissions. Check the resulting path, operation failures and cleanup ownership. Avoid predictable
shared paths and unsafe following of symlinks. Keep plaintext outside Git staging and output artifacts.
[PHP temporary files](https://www.php.net/manual/en/function.tempnam.php).

Parse structured input with a suitable parser and explicit error handling. For untrusted XML, preserve
external-entity and DTD protections and prevent network/file entity resolution. For output, use the
framework's context-appropriate escaping and authentication, authorization and CSRF controls.
Neither string interpolation nor a type declaration supplies those controls.
[OWASP XML parser guidance](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html), [output encoding](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [CSRF protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

## OPNsense integration

Use native XML models and validation for configuration owned by a plugin, authenticated API controllers
for client actions, and configd for privileged backend operations. Use the documented backup-provider
extension point for a backup provider. Verify exact core interfaces and privileges on each supported
release. The configuration model owns its own mount; generate backend settings through native templates
where that interface applies. Keep the provider's complete configuration-export operation explicit.
Avoid parallel direct configuration mutation or custom authentication paths.
[OPNsense plugin architecture](https://docs.opnsense.org/development/examples/helloworld.html).

Use native package tooling and declare actual runtime dependencies. Preserve package file ownership,
upstream notices and settings across install/upgrade/remove. Match the platform's PHP and FreeBSD ABI.
Use a disposable compatible appliance for native integration and package lifecycle tests. Linux unit
tests, analysis stubs and a parsed package manifest establish only their measured parts of that proof.
[OPNsense plugin tooling](https://github.com/opnsense/plugins), [contribution requirements](https://github.com/opnsense/plugins/blob/master/CONTRIBUTING.md).

## Tooling and review

Reuse an established repository toolchain. For new PHP code, use a coding-standard checker, PHPStan
static analysis and PHPUnit behavior tests, with compatible pinned developer dependencies. Preserve an
established Psalm or other equivalent setup when it provides the needed checks. Keep runtime installation
independent of developer-only tools.

Check syntax with the selected target PHP interpreter and style with the selected standard, such as
PHP_CodeSniffer's PSR-12 rules for OPNsense. Style checks cover the intended source and test paths and run
in check mode in CI. Record exact commands and configuration in the owning repository after verifying them.
[PHP_CodeSniffer](https://github.com/PHPCSStandards/PHP_CodeSniffer).

Run PHPStan over owned source and tests. Start new standalone code at its maximum supported level;
for host-integrated code, select a justified level and supply accurate platform symbols before assessing
the remaining gaps. Record the level, checked PHP version, scanned paths and exclusions. Discover host
symbols through autoloading or scanning; use precise stubs for missing or inaccurate type information.
Any suppression or baseline entry needs a specific reason and scope. Avoid global unknown-class ignores,
broad path exclusions or lowered checks that hide defects in newly written code.
[PHPStan levels](https://phpstan.org/user-guide/rule-levels), [symbol discovery](https://phpstan.org/user-guide/discovering-symbols), [stubs](https://phpstan.org/user-guide/stub-files).

Use a PHPUnit version compatible with the selected PHP runtime. Tests cover meaningful boundaries and
the feature's real failure, concurrency and recovery cases. Use synthetic credentials and narrow effect
test doubles. Verify framework behavior on the real supported platform as well. Production package
contents must exclude developer dependencies and private fixtures.
[PHPUnit installation requirements](https://docs.phpunit.de/en/12.5/installation.html).

The implementation review verifies the selected coding rules, analysis coverage and native platform
evidence alongside feature criteria. Syntax, formatting and static analysis each cover different defects.
Report checks that were executed and remaining gaps, including a check that ran against no owned files.

## Security checks

PHP projects run dependency auditing, security-focused source analysis and secret scanning alongside
the syntax, style, type and behavior checks above. Reuse equivalent checks already established in the
repository. Record the selected tools, pinned versions and rules, scanned paths, exclusions and
failure policy in the owning repository and run them in CI. Review verifies the actual workflow and
its results at the assessed commit. Shared guidance alone establishes the expected approach.

| Check | Expected coverage |
| --- | --- |
| Composer dependency audit | Run `composer audit --locked` against the committed lock file, including developer tools and transitive dependencies. Review advisories and abandoned-package findings. Record the result when the lock has no production packages. |
| PHP security analysis | Use a PHP-capable security analyzer with rules relevant to the code, such as Semgrep or Psalm taint analysis. Verify support for the target syntax and framework boundaries and document limitations. Model user-controlled inputs reaching commands, files, XML parsers and browser output where those effects exist. |
| Secret scanning | Use a standalone scanner such as Gitleaks when an equivalent check is absent. Declare the Git range and working-tree or artifact scope actually scanned. Redact secret values in reports and use narrowly identified allowlists for synthetic fixtures. |
| Appliance dependencies | For hosted plugins, record the native package security audit on the disposable target. Include the interpreter, extensions and declared package dependencies in the assessment. |

Composer audits packages against published advisories. PHPStan's type analysis covers the configured
type and API rules. Keep security-rule and data-flow coverage explicit in the selected analyzer's
configuration. Semgrep CE provides community-supported PHP analysis with single-function limits.
Psalm supports taint analysis for flows through application code and may need framework-specific
source, sink or sanitizer annotations. Select a compatible tool that covers the project's boundaries.
[Composer audit](https://getcomposer.org/doc/03-cli.md#audit), [Semgrep CE language support](https://docs.semgrep.dev/semgrep-ce-languages), [Psalm security analysis](https://psalm.dev/docs/security_analysis/).

Use reproducible local or immutable rules for blocking scans and verify finding-producing exit codes.
For example, `semgrep scan` needs `--error` to fail on findings. Check failures, parser errors, timeouts,
unreachable advisory sources and unexpectedly empty coverage remain failed or incomplete checks.
Record the scanned files, effective rules, findings and dispositions. Each suppression needs a specific
reason, scope and independent review. Verify scanner integration with a synthetic finding when adding
it, and retain redacted evidence outside deployable packages.
[Semgrep CLI behavior](https://docs.semgrep.dev/cli-reference), [Gitleaks usage](https://github.com/gitleaks/gitleaks).

Review security boundaries through behavior tests too, including applicable command and option
injection, unauthorized access, CSRF, XML entities, symlinks, credential disclosure and interrupted
writes. For OPNsense, run native package and security checks on owned disposable appliances and
inspect the built package for unintended files. The firmware security audit checks installed package
versions against known vulnerabilities. Record scanner results, native integration results and
remaining gaps.
[OPNsense firmware audits](https://docs.opnsense.org/manual/firmware.html#status-firmware-audits).

PHP applications and plugins with browser interfaces also follow the
[frontend testing standard](frontend-testing.md), including owned fixtures and executable browser journeys.
