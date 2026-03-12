.PHONY: docs
all: commands

## commands: show available commands (*)
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} \
	| sed -e 's/## //g' \
	| column -t -s ':'

## build: build package
build:
	python bin/font_encode.py assets/xkcd-script.ttf js/src/utils/fontData.js
	cd js && npm run build
	python -m build

## lint: check code issues
lint:
	ruff check .
	ty check .
	cd js && npm run lint

## clean: clean up
clean:
	@rm -rf ./dist
	@rm -f ./src/static/*.js
	@rm -rf ./tmp
	@find . -path './.venv' -prune -o -type d -name '.ruff_cache' -exec rm -rf {} +
	@find . -path './.venv' -prune -o -type d -name '__pycache__' -exec rm -rf {} +
	@find . -path './.venv' -prune -o -type f -name '*~' -exec rm {} +

## docs: build documentation
docs:
	@mkdir -p pages
	@cp README.md pages/index.md
	@cp LICENSE.md pages/license.md
	@cp CODE_OF_CONDUCT.md pages/conduct.md
	@cp CONTRIBUTING.md pages/contributing.md
	@mkdocs build
	@touch docs/.nojekyll
	@cp docs-requirements.txt docs/requirements.txt

## ex_js: run server to view JS examples
ex_js:
	cd js && npm start

## ex_py: re-create HTML files using Python
ex_py:
	mkdir -p tmp
	for file in examples/*.py; do \
	    name=$$(basename "$${file}" .py); \
	    python "$${file}" "data/$${name}.csv" "tmp/$${name}.html"; \
	done

## fix: fix Python code issues
fix:
	ruff check --fix .

## format: format Python code
format:
	ruff format .

## publish: publish using ~/.pypirc credentials
publish:
	twine upload --verbose dist/*

## serve: run local server for documentation
serve:
	python -m http.server
