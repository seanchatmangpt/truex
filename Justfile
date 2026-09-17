test:
    npm test

build:
    npm run build

polish:
    npm run lint

clean:
    rm -rf dist

test-full:
    npm run test:full

dev:
    npm run dev

ci: polish test-full
